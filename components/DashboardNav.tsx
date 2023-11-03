"use client";
import { RootState } from "@/redux/store";
import { Box, CircularProgress } from "@mui/material";
import Link from "next/link";
import React, { SetStateAction, useEffect } from "react";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import axios from "../app/axios";

interface DashboardNavProps {
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  accountAddress: string | null | undefined;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DashboardNav({ setOpen, accountAddress }: DashboardNavProps) {
  const { address } = useSelector((state: RootState) => state.eoaConnect);
  const [openSlider, setOpenSlider] = React.useState<boolean>(false);
  const [owners, setOwners] = React.useState<Array<string>>([]);
  const handleClickOpen = () => {
    setOpenSlider(true);
  };

  const handleClose = () => {
    setOpenSlider(false);
  };

  const getOwners = async () => {
    const req = await axios.get(`/api/account/${accountAddress}`);
    setOwners(req.data.owners);
  };

  useEffect(() => {
    getOwners();
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-slate-900 h-14 flex justify-between items-center">
      <Dialog
        open={openSlider}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        color="rgb(15 23 42)"
      >
        <Box sx={{ backgroundColor: "rgb(15 23 42)" }}>
          <div className="m-8 p-2 ">
            {owners?.map((owner) => (
              <p className="bg-slate-200 rounded-xl p-2 my-3">{owner}</p>
            ))}
          </div>
        </Box>
      </Dialog>
      <div>
        <Link href={"/start"}>
          <button className="text-sm font-kanit_bold text-slate-100 bg-slate-800 p-2 rounded-xl ml-3 hover:scale-105 transition-all ease-in-out hover:bg-slate-900">
            Go Back
          </button>
        </Link>

        <button
          onClick={() => handleClickOpen()}
          className="text-sm font-kanit_bold text-slate-100 bg-slate-800 p-2 rounded-xl ml-3 hover:scale-105 transition-all ease-in-out hover:bg-slate-900"
        >
          View Owners
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-kanit_bold text-slate-100 bg-slate-800 rounded-xl hover:scale-105 transition-all ease-in-out hover:bg-slate-900 h-fit p-2"
        >
          SCR Configure
        </button>
        <div className="text-sm font-kanit_bold bg-slate-950 text-slate-100 self-stretch px-3 py-2 rounded-xl m-3">
          {address ? (
            address
          ) : (
            <Box sx={{ display: "flex" }}>
              <CircularProgress size={"12px"} />
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardNav;
