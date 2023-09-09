"use client";

import Dropdown from "@/components/Dropdown";
import React, { useEffect } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { deployAll } from "@/redux/deploySlice";
import { connectWallet } from "@/redux/EOAConnectSlice";

function page() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(connectWallet());
  }, []);
  return (
    <div className="flex justify-center items-center mb-20">
      <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-800 rounded-xl shadow-xl shadow-slate-900 h-1/2 mt-32 p-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl text-center md:text-3xl text-blue-200 font-kanit_bold mb-12 p-2 rounded-xl">
            Create Safe Wallet
          </h1>
          <div className="inputFields flex flex-col justify-center gap-5 mb-10">
            <input
              className="p-2 px-3 w-full outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="safe-account-name"
              type="text"
            />
            <div className="flex flex-col">
              <span className="float-left font-light text-opacity-60 text-white -mb-2 text-xs">
                Network
              </span>
              <Dropdown />
            </div>
          </div>
          <button
            onClick={() => dispatch(deployAll())}
            className="bg-blue-950  font-kanit_bold p-2 md:p-2 my-2 rounded-lg text-gray-200 shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-105 transition ease-in-out duration-200 active:bg-blue-100 w-22 md:w-44"
          >
            Create Safe Wallet
          </button>
          <p className="text-gray-400 text-sm fontExtraLight">
            By continuing, you agree to our terms of use and privacy policy.
          </p>
        </div>
        {/* <div >
          <p className="text-gray-400 text-sm fontExtraLight">Connect to Wallet to continue..</p>
      </div> */}
      </div>
    </div>
  );
}

export default page;
