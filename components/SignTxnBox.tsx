import { store } from "@/redux/store";
import axios from "../app/axios";
import { Dispatch, SetStateAction } from "react";
import { Wallet, ethers } from "ethers";

interface txnInterface {
  transactionType: string;
  currentSignCount: number;
  signedOwners: any;
  txnAmount: number;
  recipientAddress: string;
  paymaster: boolean;
  _id: string;
  __v: number;
}

interface SignTxnBoxProps {
  txnData: txnInterface | undefined;
  setHandleSignTxnComponent: Dispatch<SetStateAction<boolean>>;
  safeAddress: string;
  threshold: number;
}

function SignTxnBox({
  txnData,
  setHandleSignTxnComponent,
  safeAddress,
  threshold,
}: SignTxnBoxProps) {
  console.log("eoaAddress", store.getState().eoaConnect.address);
  // console.log(store.getState().eoaConnect.address);
  const handleSignTransaction = async () => {
    try {
      const currentTxnHash = await axios.post("/api/txn/getTxHash", {
        safeAddress: safeAddress,
        amount: txnData?.txnAmount,
        recipientAddress: txnData?.recipientAddress,
        paymasterParams: txnData?.paymaster,
        txnType: txnData?.transactionType,
      });
      console.log(currentTxnHash);
      // const ethSignRequest = await window.ethereum.request({
      //   method: "eth_sign",
      //   params: [eoaAddress, currentTxnHash.data.message],
      // });
      const signer_pkey: any = store.getState().eoaConnect.pkey;
      const signer = new Wallet(signer_pkey);
      const signature = ethers.utils.joinSignature(
        signer._signingKey().signDigest(currentTxnHash.data.message)
      );
      console.log(signature);
      const signaturePost = await axios.post("/api/txn/signTxn", {
        signedDigest: signature,
        signerAddress: store.getState().eoaConnect.address,
        safeAddress: safeAddress,
        txnId: txnData?._id,
        recipientAddress: txnData?.recipientAddress,
        txnAmount: txnData?.txnAmount,
        txnType: txnData?.transactionType,
      });
      console.log(signaturePost);
      if (signaturePost.status === 200) {
        alert("Signed Transaction Succesfully. Click Ok to refresh the page");
        window.location.reload();
      }
    } catch (error) {
      console.log("An error occured while signing the tranasction - ", error);
    }
  };

  return (
    <div className="createTxn text-yellow-50 m-auto p-10 w-1/3 bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-800 rounded-xl shadow-sm shadow-slate-900 flex flex-col justify-center items-center">
      <button
        onClick={() => setHandleSignTxnComponent(false)}
        className="text-blue-300 font-bold ml-auto"
      >
        {" "}
        X
      </button>
      <div className="flex flex-col justify-center w-full">
        <h1 className="text-3xl text-blue-50 font-kanit_bold mb-12 p-2 rounded-xl w-full text-center">
          Transaction Info
        </h1>
        <div className="flex justify-between mb-2">
          <div className="flex gap-2">
            <p className="font-bold">txn type:</p>
            <p>{txnData?.transactionType}</p>
          </div>
          <div className="flex gap-2">
            <p className="font-bold">txn id:</p>
            <p>{txnData?._id}</p>
          </div>
        </div>
        <div className="signedOwners">
          <div className="font-semibold flex flex-col items-center justify-center my-5">
            <p>signed owners:</p>
            <p className="text-sm text-red-500">
              {" "}
              {txnData?.signedOwners.length === 0 ? "no signatures yet.." : ""}
            </p>
            {txnData?.signedOwners.length !== 0 ? (
              <div className="flex flex-col">
                {txnData?.signedOwners.map((owner: any, index: any) => (
                  <p
                    key={index}
                    className="font-bold p-1 bg-slate-900 rounded-xl my-2"
                  >
                    {owner.signerAddress}
                  </p>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        {!txnData?.signedOwners.some(
          (s: any) => s.signerAddress === store.getState().eoaConnect.address
        ) ? (
          <button
            disabled={txnData?.signedOwners.some(
              (s: any) =>
                s.signerAddress === store.getState().eoaConnect.address
            )}
            onClick={() => handleSignTransaction()}
            className="mt-4 rounded-xl p-4 border-2 hover:bg-blue-950 active:bg-slate-800"
          >
            Sign
          </button>
        ) : txnData?.signedOwners.some(
            (s: any) => s.signerAddress === store.getState().eoaConnect.address
          ) ? (
          "User has already signed"
        ) : (
          ""
        )}
      </div>
      {threshold === txnData?.currentSignCount ? (
        <p className="font-kanit_bold mt-6 bg-slate-900 p-2 rounded-xl">
          Transaction Completed - {txnData?.txnAmount}{" "}
          {txnData?.transactionType === "mint" ? "minted" : "transferred"} to{" "}
          {txnData?.recipientAddress}
        </p>
      ) : (
        ""
      )}
    </div>
  );
}

export default SignTxnBox;
