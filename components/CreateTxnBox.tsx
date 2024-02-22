"use client";
import { CreateTxnBoxProps } from "@/app/interfaces";
import axios from "../app/axios";
import React, { useState } from "react";

function CreateTxnBox({ safeAddress, eoaAddress }: CreateTxnBoxProps) {
  const [txnAmount, setTxnAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [paymaster, setPaymaster] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  console.log(eoaAddress);
  const onSubmit = async () => {
    try {
      setLoader(true);
      const postTxn = await axios.post("/api/txn/createTxn", {
        safeAddress: safeAddress,
        transactionType: selectedType,
        // requiredThreshold: parseInt(threshold),
        userAddress: eoaAddress,
        txnAmount: txnAmount,
        recipientAddress: recipient,
        paymasterEnable: paymaster,
      });
      console.log("Transaction Created - ", postTxn);
      window.location.reload();
      setLoader(false);
    } catch (error) {
      console.log(
        "An error occured while creating post request for create txn",
        error
      );
    }
  };
  console.log(paymaster);
  return (
    <div className="createTxn text-yellow-50 m-auto p-10 bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-500 rounded-xl shadow-sm shadow-slate-900 flex flex-col justify-center items-center">
      <h1 className="text-3xl text-blue-50 font-kanit_bold mb-12 p-2 rounded-xl w-full text-center">
        Create A Transaction
      </h1>
      <div className="flex justify-between items-center w-full">
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-blue-950 rounded-lg p-2 font-semibold w-fit"
          >
            <option value="none">txn type</option>
            <option value="mint">Mint</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* <input
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          type="text"
          className="p-1 px-3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800 w-1/4"
          placeholder="threshold"
        /> */}
      </div>

      {selectedType === "transfer" ? (
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-center mt-2 font-semibold">
            send erc20 tokens to recipent
          </h1>
          <div className="flex justify-between mt-5 gap-2">
            <input
              onChange={(e) => setRecipient(e.target.value)}
              value={recipient}
              className="p-2 px-3 mx-1 w-2/3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="recipient-addr"
              type="text"
            />
            <input
              onChange={(e) => setTxnAmount(e.target.value)}
              value={txnAmount}
              className="p-2 px-3 mx-1 w-1/3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="amount"
              type="text"
            />
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer top-4 my-8">
              <input
                type="checkbox"
                checked={paymaster}
                onChange={(e) => setPaymaster(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Enable Paymaster for this Txn
              </span>
            </label>
          </div>
          <button
            onClick={() => onSubmit()}
            className="bg-slate-900 p-2 md:p-3 my-4 w-fit rounded-lg text-gray-200 text-sm font-bold shadow-sm shadow-slate-600 hover:bg-blue-200  transition ease-in-out duration-200 active:bg-blue-100 "
          >
            {loader ? "Processing..." : "Submit"}
          </button>
        </div>
      ) : selectedType === "mint" ? (
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-center mt-2 font-semibold">
            mint erc20 tokens to recipent addr
          </h1>
          <div className="flex justify-between mt-5 gap-2">
            <input
              onChange={(e) => setRecipient(e.target.value)}
              value={recipient}
              className="p-2 px-3 mx-1 w-2/3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="recipient-addr"
              type="text"
            />
            <input
              onChange={(e) => setTxnAmount(e.target.value)}
              value={txnAmount}
              className="p-2 px-3 mx-1 w-1/3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="mint-amount"
              type="text"
            />
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer top-4 my-8">
              <input
                type="checkbox"
                checked={paymaster}
                onChange={(e) => setPaymaster(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Enable Paymaster for this Txn
              </span>
            </label>
          </div>

          <button
            onClick={() => onSubmit()}
            className="bg-slate-900 p-2 md:p-3 my-4 w-fit rounded-lg text-gray-200 text-sm font-bold shadow-sm shadow-slate-600 hover:bg-blue-200  transition ease-in-out duration-200 active:bg-blue-100 "
          >
            {loader ? "Processing..." : "Submit"}
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default CreateTxnBox;
