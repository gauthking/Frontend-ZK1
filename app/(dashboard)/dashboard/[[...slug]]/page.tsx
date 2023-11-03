"use client";
import CreateTxnBox from "@/components/CreateTxnBox";
import Sidebar from "@/components/Sidebar";
import SignTxnBox from "@/components/SignTxnBox";
import { useEffect, useState } from "react";
import { AppDispatch, RootState, store } from "@/redux/store";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import {
  OpenloginAdapter,
  OPENLOGIN_NETWORK,
} from "@web3auth/openlogin-adapter";
import { useDispatch, useSelector } from "react-redux";
import {
  getPrivateKey,
  getPublicKey,
  setWProvider,
  setWeb3Auth,
} from "@/redux/EOAConnectSlice";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
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

interface txnInterface {
  transactionType: string;
  requiredThreshold: number;
  currentSignCount: number;
  signedOwners: any;
  txnAmount: number;
  recipientAddress: string;
  paymaster: boolean;
  _id: string;
  __v: number;
}

interface scrSchemaInterface {
  smartAccount: string;
  enabled: boolean;
  enabledBy: string;
  signatures: Array<string | undefined | null>;
  signedBy: Array<string | undefined | null>;
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
  p: 4,
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
  const [scrPayload, setScrPayload] = useState<scrSchemaInterface>();
  const { address } = useSelector((state: RootState) => state.eoaConnect);

  const handleClose = () => setOpen(false);

  const dispatch = useDispatch<AppDispatch>();

  const clientId: any = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT;

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x118",
            rpcTarget: "https://testnet.era.zksync.dev",
          },

          uiConfig: {
            appName: "ZKWALLET",
            // appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
            theme: {
              primary: "red",
            },
            mode: "dark",
            logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
            logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            loginGridCol: 3,
            primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
          },
          web3AuthNetwork: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET,
        });

        dispatch(setWeb3Auth(web3auth));

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
          adapterSettings: {
            uxMode: "redirect", // "redirect" | "popup"
            whiteLabel: {
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
              mode: "dark", // whether to enable dark, light or auto mode. defaultValue: auto [ system theme]
            },
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: false,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: false,
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {},
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
        await web3auth.addPlugin(torusPlugin);

        await web3auth.initModal();
        dispatch(setWProvider(web3auth.provider));

        if (web3auth.connected) {
          dispatch(getPublicKey(store.getState().eoaConnect.provider));
          dispatch(getPrivateKey(store.getState().eoaConnect.provider));
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
    const newAddress: any = store.getState().eoaConnect.address;
    setEoaAddress(newAddress);
    checkSCRStatus();
    checkSmartAccountBalance();
  });

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

  const checkSmartAccountBalance = async () => {
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
  };

  const signSCRTxn = async () => {
    const getAccount = await axios.get(`/api/account/${params.slug[1]}`);
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
    checkSCRStatus();
  };

  const checkSCRStatus = async () => {
    const req = await axios.post("/api/account/checkSCR", {
      accountAddress: params.slug[1],
    });
    setScrPayload(req.data);
  };

  return (
    <>
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
          ) : scrPayload?.signedBy.length === parseInt(params.slug[2]) ? (
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
          scrPayload?.signedBy.length !== parseInt(params.slug[2]) ? (
            <p className="text-slate-50 text-center font-light mt-3">
              Activated. Waiting for all signatures to exceute enableModule
              transaction.
            </p>
          ) : scrPayload?.enabled &&
            scrPayload?.signedBy.length === parseInt(params.slug[2]) ? (
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
                {scrPayload.signedBy?.map((owner, index) => (
                  <p
                    key={index}
                    className="font-semibold text-lg text-slate-100"
                  >
                    {owner}
                  </p>
                ))}
              </div>
              {!scrPayload.signedBy.includes(address) ? (
                <button
                  onClick={() => signSCRTxn()}
                  className="mt-6 text-sm font-kanit_bold text-slate-100 bg-blue-950 rounded-xl  h-fit p-2 hover:scale-105 transition-all ease-in-out hover:bg-slate-800"
                >
                  Sign
                </button>
              ) : (
                <p className="text-md text-slate-100 bg-slate-800 rounded-xl p-2 w-fit">
                  You have already signed!
                </p>
              )}
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
