"use client";
import Account from "@/components/Account";
import { RootState } from "@/redux/store";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const { address } = useSelector((state: RootState) => state.eoaConnect);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl md:text-6xl text-blue-200 mx-16 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-950 p-3 my-3 rounded-xl font-kanit_bold">
          WELCOME TO ZK WALLET
        </h1>
        <p className="p-2 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 my-3 rounded-xl mx-12 text-blue-200 font-bold">
          {address}
        </p>
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

          <Account />
        </div>
      </div>
    </div>
  );
};

export default Page;
