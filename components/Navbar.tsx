"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setWProvider, setIsLoggedIn } from "../redux/EOAConnectSlice";
import { AppDispatch, RootState, store } from "@/redux/store";

import ProviderConnect from "./ProviderConnect";

function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector(
    (state: RootState) => state.eoaConnect.isLoggedIn
  );

  console.log("provider - ", store.getState().eoaConnect.provider);

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
    <>
      <ProviderConnect />
      <nav className="flex items-center justify-between px-2 mx-4 py-3 bg-gradient-to-r from-gray-950 via-gray-950 to-gray-900 my-3 rounded-xl shadow-md md:mx-8 shadow-slate-900 border-b-2 border-gray-500">
        <div className="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
          <a className="text-xs md:text-sm leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-gray-300 font-bold ">
            ZK Innovations
          </a>
        </div>
        {/* <button onClick={() => getAccounts()}>Get Accounts</button> */}
        <button
          disabled={isLoggedIn ? true : false}
          onClick={() => login()}
          className={`bg-gray-800 p-2 md:p-3 my-2 mx-3 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 text-xs  ${
            !isLoggedIn
              ? "hover:bg-blue-300 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100"
              : ""
          }`}
        >
          {isLoggedIn ? "Connected" : "Connect to Web3"}
        </button>
      </nav>
    </>
  );
}

export default Navbar;
