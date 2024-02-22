"use client";
import Account from "@/components/Account";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../axios";
import { Box, Modal } from "@mui/material";
const Page = () => {
  const { address } = useSelector((state: RootState) => state.eoaConnect);

  const [isGuardian, setIsGuardian] = useState<boolean>(false);
  const [assignedZKW, setAssignedZKW] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const checkForGuardian = async () => {
    try {
      const guardians = await axios.get("/api/account/getGuardians");
      if (
        guardians.data.some(
          (guardian: any) =>
            guardian.guardianAddress === address &&
            guardian.approvedStatus === "approved"
        )
      ) {
        setIsGuardian(true);
      }
    } catch (error) {
      console.log("An error occured at checking for guardian identity", error);
    }
  };
  // console.log("guardian or not - ", isGuardian);

  useEffect(() => {
    checkForGuardian();
  }, [address]);

  const handleRecoveryNav = (zkwaddress: string) => {
    if (!address) {
      alert(
        "Please wait until the web3auth provider establishes connection with the app or please return to the home page, reconnect and try again"
      );
    }
    router.push(`/recovery/${zkwaddress}`);
  };

  const handleClose = () => setOpen(false);

  const handleOpen = async () => {
    setOpen(true);
    try {
      const getAssignedAccounts = await axios.get("/api/account");
      let accounts: any = [];
      for (let i = 0; i < getAssignedAccounts.data.length; i++) {
        console.log(getAssignedAccounts.data[i]);
        if (
          getAssignedAccounts.data[i].accountGuardians.some(
            (guardian: any) => guardian.guardianAddress === address
          )
        ) {
          accounts.push(getAssignedAccounts.data[i].accountAddress);
        }
      }
      setAssignedZKW(accounts);
      console.log(accounts);
    } catch (error) {
      console.log("An error occured while getting the assigned zkw", error);
    }
  };

  console.log("account - ", assignedZKW);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "rgb(15 23 42)",
    border: "2px solid #000",
    boxShadow: 24,
    borderRadius: 7,
    padding: 4,
    overflow: "scroll",
    height: "60%",
    width: "50%",
  };
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <header>
            <h1 className="font-kanit_bold text-xl text-white">
              Assigned ZK Wallets{" "}
            </h1>
            <p className="font-light text-white">
              (This EOA has the approval to recover the following smart account
              wallets)
            </p>
          </header>

          <div className="walletList text-black flex flex-col my-3 gap-3">
            {assignedZKW.map((address: any) => (
              <p
                onClick={() => handleRecoveryNav(address)}
                className="bg-slate-100 p-2 rounded-xl cursor-pointer w-fit hover:scale-105 transition-all ease-in-out"
              >
                {address}
              </p>
            ))}
          </div>
        </Box>
      </Modal>
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <h1 className="text-4xl md:text-6xl text-blue-200 mx-16 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-950 p-3 my-3 rounded-xl font-kanit_bold">
          WELCOME TO ZK WALLET
        </h1>
        <p className="p-2 bg-gradient-to-r -mt-1 lg:mt-0 from-gray-900 via-gray-900 to-gray-950 my-3 rounded-xl mx-12 text-blue-200 font-bold">
          {address}
        </p>
      </div>
      <div className="text-white mt-8 mx-16 flex flex-col lg:flex-row gap-6">
        <div className="createAcc border-4 border-gray-500 w-full lg:w-[44%] py-8 flex flex-col gap-8 items-center rounded-xl shadow-xl shadow-slate-900 h-fit">
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
          {isGuardian && (
            <div className=" w-2/3">
              <button
                onClick={() => handleOpen()}
                className="bg-gray-700  p-2 md:p-5 rounded-lg text-gray-200 font-extrabold shadow-sm shadow-slate-600 text-xs w-full hover:bg-blue-300 hover:scale-105 transition ease-in-out"
              >
                Social Recovery Login <br /> (EOA Guardian)
              </button>
            </div>
          )}
        </div>
        <div className="w-full border-4 border-gray-500 mb-10 shadow-xl shadow-slate-900 rounded-xl p-8 flex flex-col max-h-96">
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
