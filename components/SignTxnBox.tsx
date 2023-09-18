import axios from "../app/axios";
import { Dispatch, SetStateAction } from "react";

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

interface SignTxnBoxProps {
  txnData: txnInterface | undefined;
  eoaAddress: string | null;
  setHandleSignTxnComponent: Dispatch<SetStateAction<boolean>>;
  safeAddress: string;
}

function SignTxnBox({
  txnData,
  eoaAddress,
  setHandleSignTxnComponent,
  safeAddress,
}: SignTxnBoxProps) {
  console.log(txnData);
  console.log(eoaAddress);
  const handleSignTransaction = async () => {
    try {
      const currentTxnHash = await axios.post("/api/txn/getTxHash", {
        safeAddress: safeAddress,
        amount: txnData?.txnAmount,
        recipientAddress: txnData?.recipientAddress,
      });
      console.log(currentTxnHash);
      const ethSignRequest = await window.ethereum.request({
        method: "eth_sign",
        params: [eoaAddress, currentTxnHash.data.message],
      });
      console.log(ethSignRequest);
      const signaturePost = await axios.post("/api/txn/signTxn", {
        signedDigest: ethSignRequest,
        signerAddress: eoaAddress,
        safeAddress: safeAddress,
        txnId: txnData?._id,
        recipientAddress: txnData?.recipientAddress,
        txnAmount: txnData?.txnAmount,
      });
      console.log(signaturePost);
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
                {txnData?.signedOwners.map((owner) => (
                  <p className="font-bold p-1 bg-slate-900 rounded-xl my-2">
                    {owner.signerAddress}
                  </p>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        {!txnData?.signedOwners.some((s) => s.signerAddress === eoaAddress) ? (
          <button
            disabled={txnData?.signedOwners.some(
              (s) => s.signerAddress === eoaAddress
            )}
            onClick={() => handleSignTransaction()}
            className="mt-4 rounded-xl p-4 border-2"
          >
            Sign
          </button>
        ) : txnData?.signedOwners.some(
            (s) => s.signerAddress === eoaAddress
          ) ? (
          "User has already signed"
        ) : (
          ""
        )}
      </div>
      {txnData?.requiredThreshold === txnData?.currentSignCount ? (
        <p>
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
