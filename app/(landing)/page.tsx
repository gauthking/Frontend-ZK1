"use client";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Home() {
  const isLoggedIn = useSelector(
    (state: RootState) => state.eoaConnect.isLoggedIn
  );
  console.log("logged in - ", isLoggedIn);
  return (
    <main>
      <div className="flex justify-center flex-col items-center mt-44">
        <h1 className="text-white text-6xl md:text-9xl font-kanit_bold shadow-lg landingPageLogoShadow">
          ZK WALLET
        </h1>
        <p className="text-white text-opacity-70 font-semibold mt-3 text-xs w-60 md:w-fit lg:text-2xl text-center">
          Your Ultimate Zero-Knowledge-Powered Non-Custodial Wallet Solution
        </p>
      </div>
      <div className="buttons flex justify-center gap-8 text-xs md:justify-between md:text-lg items-center w-96 m-auto mt-12">
        <Link href="/start">
          <button
            disabled={!isLoggedIn}
            className={
              isLoggedIn
                ? "bg-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100 w-22 md:w-44"
                : "g-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 w-22 md:w-44"
            }
          >
            Get Started
          </button>
        </Link>
        <Link href="/about">
          <button
            disabled={!isLoggedIn}
            className={
              isLoggedIn
                ? "bg-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100 w-22 md:w-44"
                : "g-gray-800 p-2 md:p-3 my-2 rounded-lg text-gray-200 font-bold shadow-sm shadow-slate-600 w-22 md:w-44"
            }
          >
            About Us
          </button>
        </Link>
      </div>
    </main>
  );
}
