"use client";
import CreateTxnBox from "@/components/CreateTxnBox";
import Sidebar from "@/components/Sidebar";
import { connectWallet } from "@/redux/EOAConnectSlice";
import { AppDispatch, store } from "@/redux/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function page({ params }: { params: { slug: string[] } }) {
  const dispatch = useDispatch<AppDispatch>();
  const [handleCreateTxnComponent, setHandleCreateTxnComponent] =
    useState<boolean>(false);
  const [handleSignTxnComponent, setHandleSignTxnComponent] =
    useState<boolean>(false);
  const [eoaAddress, setEoaAddress] = useState<string | null>("");
  console.log(handleCreateTxnComponent);
  useEffect(() => {
    dispatch(connectWallet()).then(() => {
      const newAddress = store.getState().eoaConnect.address;
      console.log(newAddress);
      setEoaAddress(newAddress);
    });
    console.log(store.getState().eoaConnect.address);
  }, []);
  return (
    <div className="flex">
      <Sidebar
        address={params.slug[1]}
        safeName={params.slug[0]}
        handleCreateTxnComponent={handleCreateTxnComponent}
        setHandleCreateTxnComponent={setHandleCreateTxnComponent}
      />
      {handleCreateTxnComponent === true && handleSignTxnComponent === false ? (
        <CreateTxnBox safeAddress={params.slug[1]} eoaAddress={eoaAddress} />
      ) : (
        ""
      )}
    </div>
  );
}

export default page;
