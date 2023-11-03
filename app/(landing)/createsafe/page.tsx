"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/redux/store";
import Dropdown from "@/components/Dropdown";
import axios from "../../axios";
import { useRouter } from "next/navigation";
import { deployAll, setDeployThreshold } from "@/redux/deploySlice";

const CreateSafePage = () => {
  const [network, setNetwork] = useState<string>("");
  const [safeName, setSafeName] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("0");
  const { address } = useSelector((state: RootState) => state.eoaConnect);

  const [owners, setOwners] = useState<
    Array<{ address: string | null; id: number }>
  >([]);

  const [ownerLength, setOwnerLength] = useState<number>(1);
  console.log(owners);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const newAddress = store.getState().eoaConnect.address;
    console.log(newAddress);
    setOwners([{ address: newAddress, id: 0 }]);
    console.log(owners);
  }, [address]);

  console.log(ownerLength);
  const createSafe = async () => {
    try {
      dispatch(setDeployThreshold(threshold));
      let ownerList = [];
      for (let i = 0; i < owners.length; i++) {
        ownerList.push(owners[i].address);
      }
      console.log(ownerList);
      await dispatch(deployAll(ownerList));
      console.log(store.getState().deployContracts.safeAddress);
      await axios
        .post("/api/account/", {
          accountAddress: store.getState().deployContracts.safeAddress,
          accountName: safeName,
          setThreshold: parseInt(threshold),
          owners: ownerList,
          network: network,
          socialRecoveryModuleAddress:
            store.getState().deployContracts.socialRecoveryAddress,
        })
        .then((res) => {
          console.log(res);
          router.push(
            `/dashboard/${safeName}/${
              store.getState().deployContracts.safeAddress
            }/${parseInt(threshold)}`
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleOwnerAddition = () => {
    if (ownerLength <= 7) {
      setOwnerLength(ownerLength + 1);
      console.log(owners);
      setOwners([...owners, { address: "", id: ownerLength }]);
      console.log(owners);
    } else {
      alert("Owner limit reached");
    }
  };

  const handleOwnerAddressChange = (e, index) => {
    const newOwners = [...owners];
    newOwners[index] = { ...newOwners[index], address: e.target.value };
    setOwners(newOwners);
  };

  const handleOwnerDeletion = (index: number) => {
    const newOwners = owners
      .filter((_, i) => i !== index)
      .map((owner, i) => ({ ...owner, id: i }));
    setOwners(newOwners);
    setOwnerLength(ownerLength - 1);
  };

  return (
    <div className="flex justify-center items-center mb-20">
      <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-gray-900 border-4 border-gray-800 rounded-xl shadow-xl shadow-slate-900 h-1/2 mt-32 p-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl text-center md:text-3xl text-blue-200 font-kanit_bold mb-12 p-2 rounded-xl">
            Create Safe Wallet
          </h1>
          <div className="inputFields flex flex-col justify-center gap-5 mb-10">
            <input
              value={safeName}
              onChange={(e) => setSafeName(e.target.value)}
              className="p-2 px-3 w-full outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
              placeholder="safe-account-name"
              type="text"
            />
            <div
              className="thresholdset flex items-center gap-3 mx-2
            "
            >
              <p className="text-gray-100 text-opacity-60 text-xs font-light">
                threshold
              </p>
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="p-1 px-3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800 w-1/4"
                placeholder="1"
              />
            </div>
            <div className="flex flex-col">
              <span className="float-left font-light text-opacity-60 text-white -mb-2 text-xs">
                Network
              </span>
              <Dropdown setNetwork={setNetwork} />
            </div>
            <div className="ownersList mx-2">
              <div className="flex justify-between items-center mb-4">
                <p className="font-light text-opacity-60 text-white text-sm ">
                  Set Owners
                </p>
                <button
                  onClick={() => handleOwnerAddition()}
                  className="text-white text-2xl px-2 mx-2 rounded-3xl font-bold bg-blue-900 hover:bg-blue-600 transition-all ease-in-out"
                >
                  +
                </button>
              </div>
              <div className="setownerlist flex flex-col gap-2">
                {owners?.map((owner, index) => (
                  <div
                    key={index}
                    className="defaultowner mx-2 bg-slate-800 p-2 rounded-xl flex gap-2"
                  >
                    <input
                      className="text-sm  p-1 px-3 outline-none bg-gray-900 rounded-xl text-gray-100 font-bold shadow-sm shadow-gray-800"
                      value={owner.address}
                      placeholder={"owner-" + (index + 1) + " address"}
                      onChange={(e) => handleOwnerAddressChange(e, index)}
                    />
                    {index !== 0 ? (
                      <button
                        onClick={() => handleOwnerDeletion(index)}
                        className="p-2 rounded-xl bg-slate-900 font-semibold text-sm hover:bg-red-400 transition-all ease-in-out text-slate-300"
                      >
                        delete
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => createSafe()}
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
};

export default CreateSafePage;
