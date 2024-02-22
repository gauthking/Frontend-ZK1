"use client";

import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import {
  OpenloginAdapter,
  OPENLOGIN_NETWORK,
} from "@web3auth/openlogin-adapter";
import { useDispatch } from "react-redux";
import { AppDispatch, store } from "@/redux/store";
import {
  checkETHEOABalance,
  getPrivateKey,
  getPublicKey,
  setIsLoggedIn,
  setWProvider,
  setWeb3Auth,
} from "@/redux/EOAConnectSlice";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
function ProviderConnect() {
  const clientId: any = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT;
  const dispatch = useDispatch<AppDispatch>();
  const [torusPlugin, setTorusPlugin] =
    useState<TorusWalletConnectorPlugin | null>(null);
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
            loginConfig: {
              google: {
                verifier: "zkw-google-auth",
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
        await web3auth.addPlugin(torusPlugin);
        dispatch(setWeb3Auth(web3auth));
        await web3auth.initModal();
        dispatch(setWProvider(web3auth.provider));

        if (web3auth.connected) {
          dispatch(setIsLoggedIn(true));
          await dispatch(getPublicKey(store.getState().eoaConnect.provider));
          await dispatch(getPrivateKey(store.getState().eoaConnect.provider));
          await dispatch(
            checkETHEOABalance(store.getState().eoaConnect.provider)
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);
  return <div></div>;
}

export default ProviderConnect;
