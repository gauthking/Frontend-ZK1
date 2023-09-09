"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux/es/exports";
import { connectWallet } from "../../redux/EOAConnectSlice";
import { AppDispatch } from "@/redux/store";
function page() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(connectWallet());
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl md:text-6xl text-blue-200 mx-16 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-950 p-3 my-3 rounded-xl font-kanit_bold">
          WELCOME TO ZK WALLET
        </h1>
        <p className="p-2 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 my-3 rounded-xl mx-12 text-blue-200 font-bold"></p>
      </div>
      <div className="text-white mt-8 mx-16 flex flex-col lg:flex-row gap-6">
        <div className="createAcc border-4 border-gray-800 w-full lg:w-[44%] py-8 flex flex-col gap-8 items-center rounded-xl shadow-xl shadow-slate-900 h-fit">
          <h1 className="text-xl md:text-3xl text-blue-400 mx-16 font-kanit_bold mb-2">
            Accounts
          </h1>
          <Link href="/createsafe" className=" w-2/3">
            <button className="bg-gray-700  p-2 md:p-5 rounded-lg text-gray-200 font-extrabold shadow-sm shadow-slate-600 text-xs w-full hover:bg-blue-300 hover:scale-105 transition ease-in-out">
              Create Account
            </button>
          </Link>
          <button className="bg-gray-700  p-2 md:p-5 rounded-lg text-gray-200 font-extrabold shadow-sm shadow-slate-600 text-xs w-2/3 hover:bg-blue-300 hover:scale-105 transition ease-in-out">
            Add Existing Account
          </button>
        </div>
        <div className="w-full border-4 border-gray-800 shadow-xl shadow-slate-900 rounded-xl p-8 flex flex-col max-h-96">
          <h1 className="text-xl md:text-3xl text-blue-400 mx-2 text-center font-kanit_bold mb-6">
            My Safe Wallets
          </h1>
          <div className="accountslist overflow-y-scroll rounded-xl py-2 innerShadow">
            <div
              title="Use this account"
              className="account flex items-center justify-around p-4 border-2 rounded-xl mx-10 my-4 cursor-pointer bg-gray-950 hover:bg-blue-500 hover:scale-105 transition-all ease-in-out"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/6840/6840478.png"
                className="w-10 border-2 border-gray-400 rounded-full p-1 mr-4"
                alt="walleticon"
              />
              <div className="flex flex-col overflow-x-scroll space-y-2">
                <p className="accountname font-bold">Account Name</p>
                <p className="accountaddress font-semibold ">
                  0x6Cf0944aDB0e90E3b89d0505e9B9668E8c0E0bA1
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
