"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { connectWallet } from "../redux/EOAConnectSlice";
import { AppDispatch, RootState } from "@/redux/store";
function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, address } = useSelector(
    (state: RootState) => state.eoaConnect
  );
  console.log(isConnected);
  return (
    <nav className="flex items-center justify-center px-2 py-3 bg-gradient-to-r from-gray-950 via-gray-950 to-gray-900 my-3 rounded-xl shadow-md mx-2 md:mx-8 shadow-slate-900 border-b-2 border-gray-800">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
          <a className="text-xs md:text-sm leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-gray-300 font-bold ">
            ZK Innovations
          </a>
        </div>
        <button
          disabled={isConnected}
          onClick={() => dispatch(connectWallet())}
          className={`bg-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 text-xs  ${
            !isConnected
              ? "hover:bg-blue-300 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100"
              : ""
          }`}
        >
          {isConnected ? "Connected" : "Connect to Web3"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
