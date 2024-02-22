import { Dispatch, SetStateAction } from "react";
import SafeAccountInfo from "./SafeAccountInfo";
import TransactionList from "./TransactionList";
import { store } from "@/redux/store";
import { sidebarProps, txnInterface } from "@/app/interfaces";

function Sidebar({
  address,
  safeName,
  threshold,
  setHandleCreateTxnComponent,
  handleCreateTxnComponent,
  handleSignTxnComponent,
  setHandleSignTxnComponent,
  setTxnPayload,
}: sidebarProps) {
  const handleOpenCloseComponent = () => {
    if (!handleSignTxnComponent) {
      setHandleCreateTxnComponent(true);
    }
    if (handleSignTxnComponent) {
      setHandleSignTxnComponent(false);
      setHandleCreateTxnComponent(true);
    }
    if (handleCreateTxnComponent) {
      setHandleCreateTxnComponent(false);
    }
  };

  console.log(store.getState().eoaConnect.provider);
  return (
    <div className="h-screen w-[22%] bg-gradient-to-b from-gray-900 via-slate-950 to-slate-900 shadow-blue-900 shadow-sm  p-3 px-4 flex flex-col items-center justify-between">
      <SafeAccountInfo address={address} safeName={safeName} />
      <TransactionList
        address={address}
        threshold={threshold}
        setTxnPayload={setTxnPayload}
        setHandleSignTxnComponent={setHandleSignTxnComponent}
        handleSignTxnComponent={handleSignTxnComponent}
      />
      <button
        onClick={() => handleOpenCloseComponent()}
        className="bg-slate-900 p-2 md:p-3 mb-10 rounded-lg text-gray-200 text-sm font-bold shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100 "
      >
        Create Transaction
      </button>
    </div>
  );
}

export default Sidebar;
