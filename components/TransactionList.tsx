import React, { useState, useEffect, useMemo } from "react";
import axios from "../app/axios";
import { store } from "@/redux/store";

interface txnInterface {
  transactionType: string;
  requiredThreshold: number;
  currentSignCount: number;
  signedOwners: [];
  _id: string;
  __v: number;
}

function TransactionList({ address }) {
  const [txnData, setTxnData] = useState<Array<txnInterface>>([]);

  const fetchData = async (address) => {
    try {
      const req = await axios.get(`/api/txn/${address}`);
      setTxnData(req.data.transactions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchData(address);
    }
  }, [address]);

  const memoizedComponent = useMemo(
    () => (
      <div className="w-full flex flex-col items-center justify-between gap-4">
        <h1 className="font-kanit_bold text-xl text-yellow-50">Transactions</h1>
        <div className="min-h-[200px] w-full border-t-2 border-blue-100 border-opacity-10 rounded-xl">
          {txnData.map((txn, index) => (
            <div
              key={index}
              className="flex flex-col m-3 p-2 rounded-xl bg-slate-900 cursor-pointer hover:bg-slate-800"
            >
              <p className="text-yellow-50 text-xs font-light flex gap-2 ">
                <p className="font-bold">tid:</p> {txn._id}
              </p>
              <p className="text-yellow-50 text-xs font-light flex gap-2 mb-2">
                <p className="font-bold">type:</p> {txn.transactionType}
              </p>
              <div className="flex justify-between">
                <p className="text-yellow-50 text-xs flex gap-2">
                  <p className="font-bold text-xs">curr:</p>{" "}
                  {txn.currentSignCount}
                </p>
                <p className="text-yellow-50 text-xs flex gap-2">
                  <p className="font-bold text-xs">req:</p>{" "}
                  {txn.requiredThreshold}
                </p>
              </div>
              <div className="flex gap-2 items-center justify-center text-yellow-50 mt-2">
                <p className="text-xs font-bold">status:</p>{" "}
                <p className="text-xs">
                  {txn.requiredThreshold === txn.currentSignCount
                    ? "completed"
                    : txn.currentSignCount + "/" + txn.requiredThreshold}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [txnData]
  );

  return memoizedComponent;
}

export default TransactionList;
