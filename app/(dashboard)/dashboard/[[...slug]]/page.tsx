"use client";
import CreateTxnBox from "@/components/CreateTxnBox";
import Sidebar from "@/components/Sidebar";
import SignTxnBox from "@/components/SignTxnBox";
import { connectWallet } from "@/redux/EOAConnectSlice";
import { AppDispatch, store } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface txnInterface {
  transactionType: string;
  requiredThreshold: number;
  currentSignCount: number;
  signedOwners: any;
  txnAmount: number;
  recipientAddress: string;
  _id: string;
  __v: number;
}

function page({ params }: { params: { slug: string[] } }) {
  const dispatch = useDispatch<AppDispatch>();
  const [handleCreateTxnComponent, setHandleCreateTxnComponent] =
    useState<boolean>(false);
  const [handleSignTxnComponent, setHandleSignTxnComponent] =
    useState<boolean>(false);
  const [txnPayload, setTxnPayload] = useState<txnInterface>();
  const [eoaAddress, setEoaAddress] = useState<string | null>("");
  console.log(handleSignTxnComponent);
  useEffect(() => {
    dispatch(connectWallet()).then(() => {
      const newAddress = store.getState().eoaConnect.address;
      console.log(newAddress);
      setEoaAddress(newAddress);
    });
    console.log(store.getState().eoaConnect.address);
  }, []);

  console.log(eoaAddress);
  return (
    <div className="flex">
      <Sidebar
        address={params.slug[1]}
        safeName={params.slug[0]}
        handleCreateTxnComponent={handleCreateTxnComponent}
        setHandleCreateTxnComponent={setHandleCreateTxnComponent}
        handleSignTxnComponent={handleSignTxnComponent}
        setHandleSignTxnComponent={setHandleSignTxnComponent}
        setTxnPayload={setTxnPayload}
      />
      {handleCreateTxnComponent === true && handleSignTxnComponent === false ? (
        <CreateTxnBox safeAddress={params.slug[1]} eoaAddress={eoaAddress} />
      ) : handleCreateTxnComponent === false &&
        handleSignTxnComponent === true ? (
        <SignTxnBox
          txnData={txnPayload}
          eoaAddress={eoaAddress}
          setHandleSignTxnComponent={setHandleSignTxnComponent}
          safeAddress={params.slug[1]}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default page;
