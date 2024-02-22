"use client";
import React, { useEffect, useState } from "react";
import axios from "../app/axios";
import { RootState, store } from "@/redux/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

function Account() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const { address } = useSelector((state: RootState) => state.eoaConnect);
  const [loader, setLoader] = useState<boolean>(false);
  const router = useRouter();

  const getAccounts = async (address: string | null) => {
    try {
      setLoader(true);
      const req = await axios.get("/api/account/");
      let temp = [];
      if (req.data !== 0) {
        for (let i = 0; i < req.data.length; i++) {
          const owners = req.data[i].owners;
          for (let j = 0; j < owners.length; j++) {
            if (owners[j].toLowerCase() === address?.toLowerCase()) {
              temp.push(req.data[i]);
              break;
            }
          }
        }
      }
      setAccounts(temp);
      setLoader(false);
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAccountNav = async (
    safeName: string,
    safeAddress: string,
    setThreshold: number
  ) => {
    router.push(`/dashboard/${safeName}/${safeAddress}/${setThreshold}`);
  };

  useEffect(() => {
    const newAddress: any = store.getState().eoaConnect.address;
    // console.log(newAddress);
    getAccounts(newAddress);
  }, [address]);
  return (
    <div className="accountslist overflow-y-scroll rounded-xl py-2 innerShadow">
      {!loader ? (
        accounts?.map((acc, index) => (
          <div
            onClick={() =>
              handleAccountNav(
                acc.accountName,
                acc.accountAddress,
                acc.setThreshold
              )
            }
            key={index}
            title="Use this account"
            className="account flex items-center justify-around p-4 border-2 rounded-xl mx-10 my-4 cursor-pointer bg-gray-950 hover:bg-blue-500 hover:scale-105 transition-all ease-in-out"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/6840/6840478.png"
              className="w-10 border-2 border-gray-400 rounded-full p-1 mr-4"
              alt="walleticon"
            />
            <div className="flex flex-col overflow-x-scroll space-y-2">
              <p className="accountname font-bold">{acc.accountName}</p>
              <p className="accountaddress font-semibold ">
                {acc.accountAddress}
              </p>
            </div>
          </div>
        ))
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={"52px"} />
        </Box>
      )}
    </div>
  );
}

export default Account;
