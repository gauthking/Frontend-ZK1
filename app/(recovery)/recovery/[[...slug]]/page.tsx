"use client";
import { useSelector } from "react-redux";
import axios from "../../../axios";
import { useEffect, useState } from "react";
import { RootState, store } from "@/redux/store";
import ProviderConnect from "@/components/ProviderConnect";
import { Provider, Wallet } from "zksync-web3";
import { ethers } from "ethers";
import SocialRecoveryModule from "../../../../contractABIs/SocialRecoveryModule.json";

const Page = ({ params }: { params: { slug: string[] } }) => {
  const [recoveryReason, setRecoveryReason] = useState<string>("");
  const [walletName, setWalletName] = useState<string>("");
  const [recoveryCount, setRecoveryCount] = useState<number>();
  const [owners, setOwners] = useState<string[]>([]);
  const [lastRecovery, setLastRecovery] = useState<any>();
  const [recoveries, setRecoveries] = useState<any[]>([]);
  const [recoverySelect, setRecoverySelect] = useState<any>();
  const [guardiansCount, setGuardiansCount] = useState<number>();
  const [accountInfo, setAccountInfo] = useState<any>();
  const [threshold, setThreshold] = useState<string>("");
  const [newOwners, setNewOwners] = useState<
    Array<{ address: string | null; id: number }>
  >([]);
  const [ownerLength, setOwnerLength] = useState<number>(0);

  const { address } = useSelector((state: RootState) => state.eoaConnect);

  useEffect(() => {
    getAccount();
  }, []);

  const handleOwnerAddressChange = (e: any, index: any) => {
    const newOwners1 = [...newOwners];
    newOwners1[index] = { ...newOwners1[index], address: e.target.value };
    setNewOwners(newOwners1);
  };

  const handleOwnerDeletion = (index: number) => {
    const newOwners1 = newOwners
      .filter((_, i) => i !== index)
      .map((owner, i) => ({ ...owner, id: i }));
    setNewOwners(newOwners1);
    setOwnerLength(ownerLength - 1);
  };

  const handleOwnerAddition = () => {
    if (ownerLength <= 7) {
      setOwnerLength(ownerLength + 1);
      console.log(newOwners);
      setNewOwners([...newOwners, { address: "", id: ownerLength }]);
      console.log(owners);
    } else {
      alert("Owner limit reached");
    }
  };

  console.log("slug - ", params.slug[0]);

  const selectRecoverySession = (recovery: any) => {
    if (recovery.recoveryStatus === "killed") {
      alert("RECOVERY IS KILLED, CANNOT CONFIRM THIS RECOVERY");
    }
    setNewOwners([]);
    setOwnerLength(0);
    setRecoverySelect(recovery);
    window.scrollTo({
      top: 989,
      behavior: "smooth",
    });
  };

  console.log("new owners - ", newOwners, ownerLength);

  const getAccount = async () => {
    try {
      const account = await axios.get(
        `/api/account/getAccount/${params.slug[0]}`
      );
      setAccountInfo(account.data);
      setWalletName(account.data.accountName);
      setOwners(account.data.owners);
      setRecoveryCount(account.data.recoveries.length);
      setRecoveries(account.data.recoveries);
      setGuardiansCount(
        account.data.accountGuardians.map(
          (guardian: any) => guardian.approvedStatus === "approved"
        ).length
      );
      let accountRecovery;
      for (let i = 0; i < account.data.recoveries.length; i++) {
        if (account.data.recoveries[i].recoveryStatus === "completed") {
          accountRecovery = account.data.recoveries[i];
          break;
        }
      }

      // for (let i = 1; i < account.data.recoveries.length; i++) {
      //   const ele = account.data.recoveries[i];
      //   if (
      //     ele.recoveryStatus === "completed" &&
      //     ele.executionTime > accountRecovery.executionTime
      //   ) {
      //     accountRecovery = ele;
      //   }
      // }

      setLastRecovery(accountRecovery);
    } catch (error) {
      console.log(
        "An error occured while callin the getAccount func - ",
        error
      );
    }
  };
  console.log("ADDRESS - ", address);
  const createRecoverySession = async () => {
    if (!recoveryReason) {
      alert("Please fill the recovery reason to continue");
    }
    try {
      const createRecoverySession = await axios.post(
        "/api/account/createRecoverySession",
        {
          safeAddress: params.slug[0],
          recoveryReason: recoveryReason,
          initiatedBy: address,
        }
      );
      alert(
        "New Recovery Session started!! Get confirmations from all guardians to complete and execute this recovery operation.."
      );
      getAccount();
    } catch (error: any) {
      console.log("An error occured at recovery session creation - ", error);
      alert(error.response.data.message);
      setRecoveryReason("");
    }
  };

  const confirmRecovery = async () => {
    try {
      if (newOwners.some((owner) => owner.address !== "") && threshold !== "") {
        if (
          parseInt(threshold) <=
          newOwners.filter((f) => f.address !== "").length
        ) {
          const provider = new Provider("https://zksync2-testnet.zksync.dev");
          const signer_pkey: any = store.getState().eoaConnect.pkey;
          const signer = new Wallet(signer_pkey).connect(provider);
          const balance = await provider.getBalance(signer.address);
          const minBalance = ethers.utils.parseEther("0.002");
          if (balance.lt(minBalance)) {
            const confirmTransfer = window.confirm(
              "Your wallet balance is below 0.002 ETH. Do you want to transfer some funds from a WHALE wallet?"
            );
            if (confirmTransfer) {
              const whale_pkey: any = process.env.NEXT_PUBLIC_WHALE_PRIV_KEY;
              const whale_signer = new ethers.Wallet(whale_pkey, provider);
              console.log(whale_signer);
              const tx = {
                from: "0x527c52C431B6D4b3D5c346Dad4BfC144d06Dc9cf",
                to: signer.address,
                value: ethers.utils.parseEther("0.02"),
                nonce: provider.getTransactionCount(
                  "0x527c52C431B6D4b3D5c346Dad4BfC144d06Dc9cf",
                  "latest"
                ),
                gasLimit: ethers.utils.hexlify(2000000), // 100000
                gasPrice: await provider.getGasPrice(),
              };
              await whale_signer.sendTransaction(tx).then((txn) => {
                console.log("sent funds");
                alert("Funds have been sent to the smart account");
              });
            } else {
              // User declined transfer
              throw new Error("Insufficient balance for deployment");
            }
          }
          const safeAddress = accountInfo.accountAddress;
          const scr = accountInfo.socialRecoveryModuleAddress;
          const account = new ethers.Contract(
            scr,
            SocialRecoveryModule.abi,
            signer
          );
          const confirmedOwners: (string | null)[] = newOwners.map(
            (ow) => ow.address
          );
          console.log("confirmedOwners-", confirmedOwners);
          let aaTx = await account.confirmRecovery(
            safeAddress,
            confirmedOwners,
            threshold,
            true,
            {
              gasLimit: 5000000,
            }
          );
          await aaTx.wait();
          console.log(aaTx);
          const confirmRecoveryAPI = await axios.post(
            "/api/account/confirmRecovery",
            {
              safeAddress: safeAddress,
              guardianAddress: address,
              recoveryAddresses: confirmedOwners,
              newThreshold: parseInt(threshold),
              recoveryId: recoverySelect.recoveryId,
              scrAddress: scr,
            }
          );
          alert(confirmRecoveryAPI.data.message);
          console.log(confirmRecoveryAPI);
        } else {
          alert(
            "Please make sure to have a new threshold that is less than or equal to the number of new owners added. Also do not add any blank owner fields"
          );
          setNewOwners([]);
          setThreshold("");
        }
      } else {
        alert("Please input the addresses of the new owners and try again");
      }
    } catch (error) {
      console.log("An error occurred while confirming recovery - ", error);
    }
  };

  return (
    <>
      <ProviderConnect />
      <h1 className="text-4xl md:text-6xl text-blue-200 mx-6 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-950 p-3 rounded-xl font-kanit_bold mt-4">
        Social Recovery
      </h1>
      <div className="flex flex-col lg:flex-row w-full py-4 gap-10 md:gap-3">
        <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-500 rounded-xl shadow-xl shadow-slate-900 w-full  lg:w-[35%] p-10 flex flex-col justify-start mx-4 overflow-y-scroll max-h-[600px]">
          <h1 className="text-xl md:text-2xl underline text-blue-400 mx-2 text-center font-kanit_bold mb-6">
            Wallet Recovery Info
          </h1>
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex w-full items-center gap-3 text-sm">
              <p className="font-semibold font-mono px-2 py-1 rounded-xl bg-blue-600 w-fit ">
                Wallet Name:
              </p>
              <p className="font-medium font-sans px-2 py-1 rounded-xl text-white w-fit">
                {walletName}
              </p>
            </div>
            <div className="flex w-full items-center gap-3 text-sm">
              <p className="font-semibold font-mono px-2 py-1 rounded-xl bg-blue-600 w-fit ">
                Address:
              </p>
              <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit">
                {params.slug[0]}
              </p>
            </div>
            <div className="flex-col w-full items-center justify-center gap-6 text-sm my-3 ">
              <p className="font-semibold font-mono px-2 py-1 rounded-xl bg-blue-600 w-fit ">
                Current Owners:
              </p>
              <div className="border-2 border-gray-600 rounded-xl p-2 mt-2">
                {owners.map((owner) => (
                  <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit">
                    {owner}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex w-full items-center gap-3 text-sm">
              <p className="font-semibold font-mono px-2 py-1 rounded-xl bg-blue-600 w-fit ">
                No of Recoveries Made:
              </p>
              <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit">
                {recoveryCount}
              </p>
            </div>
            <div className="flex-col w-full items-center justify-center gap-6 text-sm my-3 ">
              <p className="font-semibold font-mono px-2 py-1 rounded-xl bg-blue-600 w-fit ">
                Last Recovery Execution Info:
              </p>
              {lastRecovery ? (
                <div className="border-2 border-gray-600 rounded-xl p-2 mt-2">
                  <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit mb-2">
                    Initiated By : {lastRecovery.initiatedBy}
                  </p>
                  <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit mb-2">
                    Date & Time : 22-12-2023 / 15:58
                  </p>
                </div>
              ) : (
                <div className="border-2 border-gray-600 rounded-xl p-2 mt-2">
                  <p className="font-medium font-sans  px-2 py-1 rounded-xl text-white w-fit mb-2">
                    No last execution of recoveries found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <section className="flex flex-col w-full lg:w-[65%]">
          <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-500 rounded-xl shadow-xl shadow-slate-900 p-10 flex flex-col justify-center mx-4">
            <h1 className="text-xl md:text-2xl underline text-blue-400 mx-2 font-kanit_bold mb-6">
              Recover your Wallet
            </h1>
            <div className="flex items-center justify-center gap-2">
              <input
                value={recoveryReason}
                onChange={(e) => setRecoveryReason(e.target.value)}
                className="p-2 px-3 w-[76%] outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
                placeholder="recovery-reason"
                type="text"
              />
              <button
                onClick={() => createRecoverySession()}
                className="bg-blue-950  font-kanit_bold rounded-lg text-gray-200 shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-105 transition ease-in-out duration-200 active:bg-blue-100 w-[24%] p-2"
              >
                Create Recovery Session
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-500 rounded-xl shadow-xl shadow-slate-900 p-10 flex flex-col mx-4 max-h-64 overflow-scroll mt-4">
            {recoveries.map((recovery) => (
              <div
                onClick={() => selectRecoverySession(recovery)}
                className="w-full rounded-xl border-gray-500 border-2 p-2 flex flex-col my-3 hover:bg-blue-500 hover:scale-105 transition-all ease-in-out cursor-pointer"
              >
                <div className="flex flex-row justify-between mx-1 ">
                  <p className="font-light text-white">
                    {recovery.recoveryReason.slice(0, 34) + "....."}
                  </p>
                  <p className="font-light text-white">{recovery.recoveryId}</p>
                  <div className="flex gap-2">
                    <p className="font-light text-white">Initiated At :</p>
                    <p className="font-semibold text-white">12-12-2023</p>
                  </div>
                </div>
                <div className="flex gap-2 text-white mx-2">
                  <p className="font-light">Initiated by</p> :{" "}
                  <p className="font-kanit_bold">{recovery.initiatedBy}</p>
                </div>
                <div className=" flex justify-center gap-3 text-white">
                  <p className="font-light">Status</p> :{" "}
                  <p
                    className={`font-kanit_bold ${
                      recovery.recoveryStatus === "killed"
                        ? "text-red-500"
                        : recovery.recoveryStatus === "completed"
                        ? "text-green-500"
                        : "text-white"
                    }`}
                  >
                    {recovery.recoveryStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="border-t-4 border-gray-800 rounded-2xl bg-[#020206] p-4 min-h-screen">
        <h1
          className={`text-center text-gray-600 shadow-lg relative -top-10 text-xl font-kanit_bold ${
            recoverySelect?.recoveryStatus === "killed"
              ? "bg-red-500"
              : "bg-slate-200"
          }  p-2 rounded-3xl w-fit m-auto border-gray-800 border-4`}
        >
          Recovery Overview
        </h1>
        {recoverySelect ? (
          <div className="flex flex-col mx-8 gap-3">
            <div className="flex justify-between">
              <div className="text-white text-xl flex gap-2">
                <p className="font-kanit_bold">Recovery Reason:</p>{" "}
                <p className="font-light">{recoverySelect.recoveryReason}</p>
              </div>
              <div className="text-white text-xl flex gap-2">
                <p className="font-kanit_bold">Initiated At:</p>{" "}
                <p className="font-light">12-12-2023</p>
              </div>
            </div>
            <div className="flex gap-3 text-white text-2xl">
              <p className="font-kanit_bold">Initiated By : </p>
              <p className="font-light">{recoverySelect.initiatedBy} </p>
            </div>

            <div className="mt-4 text-white text-2xl flex gap-2">
              <p className="font-kanit_bold">Guardians Confirmed :</p>
              <p>
                {recoverySelect.confirmedRecoveryList.length} / {guardiansCount}
              </p>
            </div>
            {newOwners.length !== 0 &&
            recoverySelect.recoveryStatus !== "killed" ? (
              <button
                onClick={() => confirmRecovery()}
                className="bg-slate-300  font-kanit_bold rounded-lg text-blue-800 shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-105 transition ease-in-out duration-200 active:bg-blue-100 w-[24%] p-2"
              >
                Confirm Recovery
              </button>
            ) : (
              ""
            )}
            {recoverySelect.recoveryStatus === "ongoing" ? (
              <section className="ownersList mx-2">
                <input
                  type="text"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="p-2 px-3 outline-none bg-gray-900 rounded-xl text-gray-100 my-4 font-bold shadow-sm shadow-gray-800 w-1/4"
                  placeholder="new threshold"
                />
                <div className="flex justify-between items-center mb-4">
                  <p className="font-light text-opacity-60 text-white text-sm ">
                    Set New Owners
                  </p>
                  <button
                    onClick={() => handleOwnerAddition()}
                    className="text-white text-2xl px-2 mx-2 rounded-3xl font-bold bg-blue-900 hover:bg-blue-600 transition-all ease-in-out"
                  >
                    +
                  </button>
                </div>
                <div className="setownerlist flex flex-col gap-2">
                  {newOwners?.map((owner: any, index) => (
                    <div
                      key={index}
                      className="defaultowner mx-2 bg-slate-800 p-2 rounded-xl flex gap-2"
                    >
                      <input
                        className="text-sm w-full  p-1 px-3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
                        value={owner.address}
                        placeholder={"owner-" + (index + 1) + " address"}
                        onChange={(e) => handleOwnerAddressChange(e, index)}
                      />

                      <button
                        onClick={() => handleOwnerDeletion(index)}
                        className="p-2 rounded-xl bg-slate-900 font-semibold text-sm hover:bg-red-400 transition-all ease-in-out text-slate-300"
                      >
                        delete
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : recoverySelect.recoveryStatus == "killed" ? (
              <p className="text-red-600 font-kanit_bold text-3xl">
                Cannot Access this Recovery Session. SESSION KILLED
              </p>
            ) : recoverySelect.recoveryStatus == "completed" ? (
              <p className="text-green-600 font-kanit_bold text-3xl">
                Cannot Access this Recovery Session. RECOVERY COMPLETED. Check
                for the updated owners in the safe -{" "}
                {accountInfo.accountAddress}
              </p>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
};

export default Page;
