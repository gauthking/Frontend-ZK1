"use client";
import React, { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { useDispatch, useSelector } from "react-redux";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import {
  OpenloginAdapter,
  OPENLOGIN_NETWORK,
} from "@web3auth/openlogin-adapter";
import {
  getPrivateKey,
  getPublicKey,
  setWProvider,
  setWeb3Auth,
  setIsLoggedIn,
} from "../redux/EOAConnectSlice";
import { AppDispatch, RootState, store } from "@/redux/store";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector(
    (state: RootState) => state.eoaConnect.isLoggedIn
  );
  const clientId: any = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT;

  const [torusPlugin, setTorusPlugin] =
    useState<TorusWalletConnectorPlugin | null>(null);

  const init = async () => {
    console.log("init");
    try {
      const web3auth = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x118",
          rpcTarget: "https://testnet.era.zksync.dev", // This is the public RPC we have added, please pass on your own endpoint while creating an app
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
          loginConfig: {
            google: {
              verifier: "zkwallet-new-google-verifier",
              typeOfLogin: "google",
              clientId: process.env.NEXT_PUBLIC_GOOGLECLIENTID, // this should be the google client id. pls pass it
            },
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
      setTorusPlugin(torusPlugin);
      await web3auth.addPlugin(torusPlugin);
      dispatch(setWeb3Auth(web3auth));

      await web3auth.initModal();
      dispatch(setWProvider(web3auth.provider));

      if (web3auth.connected) {
        dispatch(setIsLoggedIn(true));
        dispatch(getPublicKey(store.getState().eoaConnect.provider));
        dispatch(getPrivateKey(store.getState().eoaConnect.provider));
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    init();
  }, []);
  console.log(store.getState().eoaConnect.provider);

  const login = async () => {
    const web3auth = store.getState().eoaConnect.web3Auth;
    console.log("web3auth - ", web3auth);
    if (!web3auth) {
      alert("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    dispatch(() => setIsLoggedIn(true));
    dispatch(setWProvider(web3authProvider));
  };

  return (
    <nav className="flex items-center justify-center px-2 py-3 bg-gradient-to-r from-gray-950 via-gray-950 to-gray-900 my-3 rounded-xl shadow-md mx-2 md:mx-8 shadow-slate-900 border-b-2 border-gray-800">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
          <a className="text-xs md:text-sm leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-gray-300 font-bold ">
            ZK Innovations
          </a>
        </div>
        <button
          disabled={isLoggedIn ? true : false}
          onClick={() => login()}
          className={`bg-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 text-xs  ${
            !isLoggedIn
              ? "hover:bg-blue-300 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100"
              : ""
          }`}
        >
          {isLoggedIn ? "Connected" : "Connect to Web3"}
        </button>
        {/* <button onClick={() => getAccounts()}>Get Accounts</button> */}
      </div>
    </nav>
  );
}

export default Navbar;
