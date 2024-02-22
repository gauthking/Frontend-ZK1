"use client";
import CreateTxnBox from "@/components/CreateTxnBox";
import Sidebar from "@/components/Sidebar";
import SignTxnBox from "@/components/SignTxnBox";
import { useEffect, useState } from "react";
import { RootState, store } from "@/redux/store";
import { useSelector } from "react-redux";
import Image from "next/image";
import zklogo from "../../../../assets/zklogo.png";
import DashboardNav from "@/components/DashboardNav";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import axios from "../../../axios";
import { CircularProgress } from "@mui/material";
import { Wallet, ethers } from "ethers";
import { Provider } from "zksync-web3";
import erc20ABI from "../../../../contractABIs/ERC20.json";

import ProviderConnect from "@/components/ProviderConnect";
import { accountGuardians, txnInterface } from "@/app/interfaces";

interface scrSchemaInterface {
  smartAccount: string;
  enabled: boolean;
  enabledBy: string;
  signatures: Array<any>;
  _id: string;
  __v: number;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "rgb(15 23 42)",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: 7,
  padding: 4,
  overflow: "scroll",
  height: "92%",
};

const Page = ({ params }: { params: { slug: string[] } }) => {
  const [handleCreateTxnComponent, setHandleCreateTxnComponent] =
    useState<boolean>(false);
  const [handleSignTxnComponent, setHandleSignTxnComponent] =
    useState<boolean>(false);
  const [txnPayload, setTxnPayload] = useState<txnInterface>();
  const [eoaAddress, setEoaAddress] = useState<string | null>("");
  const [open, setOpen] = useState(false);
  const [loaderModal, setLoaderModal] = useState<boolean>(false);
  const [gAddress, setGAddress] = useState<string | null>("");
  const [gThreshold, setGThreshold] = useState<string | null>("");
  const [scrPayload, setScrPayload] = useState<scrSchemaInterface>();
  const [guardians, setGuardians] = useState<accountGuardians[]>([]);
  const [signLoader, setSignLoader] = useState<boolean>(false);
  const [owners, setOwners] = useState([]);

  const { address, eoaBalanceETH } = useSelector(
    (state: RootState) => state.eoaConnect
  );

  const handleClose = () => setOpen(false);

  useEffect(() => {
    const newAddress: any = store.getState().eoaConnect.address;
    setEoaAddress(newAddress);
    checkSCRStatus();
    checkSmartAccountBalance();
    getGuadiansAcc();
    getOwners();
  }, []);

  console.log("eth balance - ", eoaBalanceETH);

  const getOwners = async () => {
    const req = await axios.get(`/api/account/getAccount/${params.slug[1]}`);
    setOwners(req.data.owners);
  };

  const approveForGuardian = async (guardianAddress: string) => {
    try {
      const getTxnHash = await axios.post("/api/account/getGuardianCallHash", {
        safeAddress: params.slug[1],
        guardianAddress: guardianAddress,
      });
      console.log(getTxnHash);
      const signer_pkey: any = store.getState().eoaConnect.pkey;
      const signer = new Wallet(signer_pkey);
      console.log(getTxnHash.data.guardianHash);
      const signature = ethers.utils.joinSignature(
        signer._signingKey().signDigest(getTxnHash.data.guardianHash)
      );
      console.log("signature", signature);

      const signForApproval = await axios.post(
        "/api/account/signForGuardianApproval",
        {
          signedDigest: signature,
          signerAddress: address,
          safeAddress: params.slug[1],
          guardianAddress: guardianAddress,
        }
      );
      await getGuadiansAcc();
      alert("Signed for guardian approval successfully");
    } catch (error) {
      console.log(
        "An error occured while calling approveforguardian function",
        error
      );
    }
  };

  // const rejectApprovalGuardian = async (guardianAddress: string) => {
  //   try {
  //     const cancelCall = await axios.post("/api/account/cancelGuardian", {
  //       guardianAddress: guardianAddress,
  //       safeAddress: params.slug[1],
  //       rejectedByAddress: address,
  //     });
  //     alert("rejected the guardian");
  //   } catch (error) {
  //     console.log(
  //       "An error occured while calling the cancel guardian call - ",
  //       error
  //     );
  //   }
  // };

  const addGuardian = async () => {
    if (gAddress !== null && gThreshold !== null) {
      try {
        const getAccount = await axios.get(
          `/api/account/getAccount/${params.slug[1]}`
        );
        if (
          parseInt(gThreshold) >
          getAccount.data.accountGuardians.length + 1
        ) {
          alert(
            "Threshold is greater than the number of guardians already/are going to be present in the smart account. If you are adding a guardian for the first time then keep the threshold as 1"
          );
          setGThreshold("");
          setGAddress("");
          return;
        }
        const updateDB = await axios
          .post("/api/account/addGuardian", {
            safeAddress: params.slug[1],
            assignedBy: address,
            guardianAddress: gAddress,
            currentSetThreshold: gThreshold,
          })
          .then(async (d) => {
            console.log("posted guardian to db - ", d);
            await getGuadiansAcc();
          });
      } catch (e) {
        console.log("an error occured at addguardiancall - ", e);
      }
    } else {
      alert("Please fill the fields properly before continuing...");
    }
  };

  const toggleActionSCR = async (value: boolean) => {
    setLoaderModal(true);
    if (value === false) {
      alert("Disabling SCR WILL CLEAR THE existing signatures and signer data");
    }
    const req = await axios.post("/api/account/enableSCR", {
      accountAddress: params.slug[1],
      activatedBy: address,
      value: value,
    });
    await checkSCRStatus();
    setLoaderModal(false);
  };

  const getGuadiansAcc = async () => {
    try {
      const getAccount = await axios.get(
        `/api/account/getAccount/${params.slug[1]}`
      );
      console.log("getAccount", getAccount);
      setGuardians(getAccount.data.accountGuardians);

      console.log("guardians set");
    } catch (error) {
      console.log("An error occured at getting guardians - ", error);
    }
  };

  const checkSmartAccountBalance = async () => {
    try {
      const provider = new Provider("https://zksync2-testnet.zksync.dev");
      const balance = await provider.getBalance(params.slug[1]);
      console.log("bal", balance);
      const erc20ContractAddress = "0x4A0F0ca3A08084736c0ef1a3bbB3752EA4308bD3";
      const priv_key_whale: any = process.env.NEXT_PUBLIC_WHALE_PRIV_KEY;
      const whale_signer = new Wallet(priv_key_whale, provider);
      const erc20Contract = new ethers.Contract(
        erc20ContractAddress,
        erc20ABI.abi,
        whale_signer
      );

      const erc20Balance = await erc20Contract.balanceOf(params.slug[1]);
      console.log("erc20 balance - ", erc20Balance);

      if (parseInt(balance._hex) === 0) {
        const confirmTransfer = window.confirm(
          "Smart Account balance (ETH) is 0. Do you want to transfer some funds from a WHALE wallet?"
        );
        if (confirmTransfer) {
          const tx = {
            from: "0x527c52C431B6D4b3D5c346Dad4BfC144d06Dc9cf",
            to: params.slug[1],
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
        }
      }

      if (parseInt(erc20Balance._hex) === 0) {
        const confirmTransfer = window.confirm(
          "Smart Account balance (ERC20-TT) is 0. Do you want to transfer some funds from a WHALE wallet?"
        );
        if (confirmTransfer) {
          const amount = ethers.utils.parseUnits("10", 18);
          const erc20Tx = await erc20Contract.transfer(params.slug[1], amount);
          console.log("sent ERC20 tokens", erc20Tx);
        }
      }
    } catch (error) {
      console.log("An error occured while fetching the balances - ", error);
    }
  };

  const signSCRTxn = async () => {
    try {
      setSignLoader(true);
      const getAccount = await axios.get(
        `/api/account/getAccount/${params.slug[1]}`
      );
      console.log("getAccount", getAccount);
      const scrAddress = getAccount.data.socialRecoveryModuleAddress;
      const getTxnHash = await axios.post("/api/account/getTxnHash", {
        safeAddress: params.slug[1],
        scrmAddress: scrAddress,
      });
      console.log("txn hash", getTxnHash);
      const signer_pkey: any = store.getState().eoaConnect.pkey;
      const signer = new Wallet(signer_pkey);
      const signature = ethers.utils.joinSignature(
        signer._signingKey().signDigest(getTxnHash.data.scrTxnHash)
      );
      console.log("signature", signature);
      const sign = await axios.post("/api/account/signSCRTxn", {
        safeAddress: params.slug[1],
        signature: signature,
        signerAddress: address,
        scrAddress: scrAddress,
      });
      console.log(sign.data);
      setSignLoader(false);
      checkSCRStatus();
    } catch (error) {
      alert("An error occured while executing the signSCRTxn method");
    }
  };

  const checkSCRStatus = async () => {
    const req = await axios.post("/api/account/checkSCR", {
      accountAddress: params.slug[1],
    });
    setScrPayload(req.data);
  };

  const getMaxSetThreshold = () => {
    let setThreshold = 1;
    if (guardians.length > 0) {
      for (let i = 0; i < guardians.length; i++) {
        if (guardians[i].approvedStatus === "approved") {
          setThreshold += 1;
        }
      }
    } else {
      return setThreshold;
    }
    return setThreshold;
  };

  return (
    <>
      <ProviderConnect />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1 className="text-center font-kanit_bold text-lg text-slate-100">
            Configure Social Recovery
          </h1>
          {loaderModal ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={"22px"} />
            </Box>
          ) : scrPayload?.signatures.length === parseInt(params.slug[2]) ? (
            <div className="mt-12 flex justify-center items-center">
              <button
                title="This will deploy a new social recovery contract by the smartAccount and use the new address to build the new enableModule EIP712 transaction"
                className="text-sm font-kanit_bold text-slate-100 bg-red-700 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-red-900 active:bg-red-800"
              >
                DISABLE SCR Module.
              </button>
            </div>
          ) : (
            <div className="mt-12 flex justify-between items-center">
              <button
                onClick={() => toggleActionSCR(true)}
                disabled={scrPayload?.enabled}
                className={
                  scrPayload?.enabled
                    ? `text-sm font-kanit_bold text-slate-100 bg-slate-950 rounded-xl  h-fit p-2`
                    : `text-sm font-kanit_bold text-slate-100 bg-slate-800 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-slate-900`
                }
              >
                {scrPayload?.enabled ? "Activated" : "Activate enableSCR"}
              </button>
              <button
                onClick={() => toggleActionSCR(false)}
                disabled={!scrPayload?.enabled}
                className={
                  !scrPayload?.enabled
                    ? `text-sm font-kanit_bold text-slate-100 bg-slate-950 rounded-xl  h-fit p-2`
                    : `text-sm font-kanit_bold text-slate-100 bg-slate-800 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-slate-900`
                }
              >
                {scrPayload?.enabled
                  ? "Deactivate enableModule"
                  : "Deactivated"}
              </button>
            </div>
          )}
          {scrPayload?.enabled &&
          scrPayload?.signatures.length !== parseInt(params.slug[2]) ? (
            <p className="text-slate-50 text-center font-light mt-3">
              Activated. Waiting for all signatures to exceute enableModule
              transaction.
            </p>
          ) : scrPayload?.enabled &&
            scrPayload?.signatures.length === parseInt(params.slug[2]) ? (
            <p className="text-slate-50 text-center font-light mt-3">
              enableModule called upon receiving the threshold amount of
              signatures!!
            </p>
          ) : (
            <p className="text-slate-50 text-center font-light mt-3">
              Deactivated enableModule. To enable the SCR module, please
              activate and obtain the threshold amount of signatures to
              continue.
            </p>
          )}
          {scrPayload ? (
            <div className="my-6 mx-10 flex flex-col gap-4">
              <p className="text-lg text-slate-100 bg-slate-700 rounded-xl p-2">
                {scrPayload.enabled === true ? "Enabled" : "Disabled"} By :
                {scrPayload.enabledBy}
              </p>
              <p className="text-md text-slate-100 bg-slate-800 rounded-xl p-2 w-fit">
                Signed By:
              </p>
              <div className="mx-3 p-2 border-2">
                {scrPayload.signatures?.map((owner, index) => (
                  <p
                    key={index}
                    className="font-semibold text-lg text-slate-100"
                  >
                    {owner.signerAddress}
                  </p>
                ))}
              </div>
              {!scrPayload.signatures.some(
                (s) => s.signerAddress === address
              ) ? (
                <button
                  onClick={() => signSCRTxn()}
                  className="mt-6 text-sm font-kanit_bold text-slate-100 bg-blue-950 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-slate-800"
                >
                  {signLoader ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress size={"22px"} />
                    </Box>
                  ) : (
                    "Sign"
                  )}
                </button>
              ) : (
                <p className="text-sm text-slate-100 bg-slate-800 rounded-xl p-2 w-fit">
                  You have already signed!
                </p>
              )}
            </div>
          ) : (
            ""
          )}
          {scrPayload?.enabled &&
          scrPayload?.signatures.length === parseInt(params.slug[2]) ? (
            <div className="ml-12 ">
              <hr />
              <p className="text-md text-slate-100 font-kanit_bold p-2 w-fit rounded-xl">
                Add Guardian
              </p>
              <input
                onChange={(e: any) => setGAddress(e.target.value)}
                placeholder="Guardian Address"
                className="p-2 px-3 mx-1 my-2 w-full outline-none bg-gray-700 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
                type="text"
              />
              <input
                onChange={(e: any) => setGThreshold(e.target.value)}
                placeholder="Threshold"
                className="p-2 px-3 mx-1 my-2 w-fit outline-none bg-gray-700 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
                type="text"
              />
              <button
                onClick={() => addGuardian()}
                className="text-sm font-kanit_bold text-slate-100 bg-blue-700 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-red-900 active:bg-red-800"
              >
                Add
              </button>
              <hr />
              <div className="currentthreshold float right p-2 m-2 text-slate-200 font-medium">
                Max Threshold that can be set -{getMaxSetThreshold()}
                {guardians.some((s) => s.approvedStatus)}
              </div>
              <div className="flex flex-col gap-2 items-center my-4 w-full">
                {guardians.length !== 0
                  ? guardians.map((guardian) => (
                      <div
                        className={`w-full flex flex-col p-2 rounded-xl items-center ${
                          guardian.approvedStatus === "hold"
                            ? "bg-gray-200"
                            : guardian.approvedStatus === "rejected"
                            ? "bg-red-600"
                            : guardian.approvedStatus === "approved"
                            ? "bg-green-600"
                            : ""
                        }`}
                      >
                        <section className="flex justify-between w-full items-center">
                          <div className="flex flex-col gap-1  ">
                            <p>Guardian - {guardian.guardianAddress}</p>
                            <p>Assigned By - {guardian.assignedBy}</p>
                          </div>
                          <p className="text-sm font-extrabold">
                            {guardian.approvedStatus === "hold"
                              ? "HOLD"
                              : guardian.approvedStatus === "rejected"
                              ? "REJECTED"
                              : guardian.approvedStatus === "approved"
                              ? "APPROVED"
                              : ""}
                          </p>
                        </section>
                        {guardian.approvedStatus !== "rejected" ? (
                          <div className="mt-3 flex justify-center items-center gap-4">
                            <button
                              disabled={
                                guardian.approvalSignatures.some(
                                  (s: any) => s.signerAddress === address
                                )
                                  ? true
                                  : false
                              }
                              onClick={() =>
                                approveForGuardian(guardian.guardianAddress)
                              }
                              className="p-2 bg-blue-700 text-white rounded-xl"
                            >
                              {guardian.approvalSignatures.some(
                                (s: any) => s.signerAddress === address
                              )
                                ? "Approved"
                                : "Approve"}
                            </button>
                            {/* <button
                              onClick={() =>
                                rejectApprovalGuardian(guardian.guardianAddress)
                              }
                              className="p-2 bg-red-700 text-white rounded-xl"
                            >
                              Reject
                            </button> */}
                          </div>
                        ) : (
                          ""
                        )}
                        {guardian.approvedStatus !== "rejected" ? (
                          <div className="mr-auto w-full my-2 p-2">
                            <p>
                              Signatures Received :{" "}
                              {guardian.approvalSignatures.length} /{" "}
                              {params.slug[2]}
                            </p>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    ))
                  : ""}
              </div>
            </div>
          ) : (
            ""
          )}
        </Box>
      </Modal>
      <DashboardNav setOpen={setOpen} accountAddress={params.slug[1]} />
      <div className="flex justify-between">
        <Sidebar
          address={params.slug[1]}
          safeName={params.slug[0]}
          threshold={parseInt(params.slug[2])}
          handleCreateTxnComponent={handleCreateTxnComponent}
          setHandleCreateTxnComponent={setHandleCreateTxnComponent}
          handleSignTxnComponent={handleSignTxnComponent}
          setHandleSignTxnComponent={setHandleSignTxnComponent}
          setTxnPayload={setTxnPayload}
        />
        {handleCreateTxnComponent === true &&
        handleSignTxnComponent === false ? (
          <CreateTxnBox safeAddress={params.slug[1]} eoaAddress={eoaAddress} />
        ) : handleCreateTxnComponent === false &&
          handleSignTxnComponent === true ? (
          <SignTxnBox
            owners={owners}
            txnData={txnPayload}
            setHandleSignTxnComponent={setHandleSignTxnComponent}
            safeAddress={params.slug[1]}
            threshold={parseInt(params.slug[2])}
          />
        ) : (
          <Image
            src={zklogo}
            alt="logo"
            className="m-auto animate-spin slower"
          ></Image>
        )}
      </div>
    </>
  );
};

export default Page;
