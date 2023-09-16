import SafeAccountInfo from "./SafeAccountInfo";
import TransactionList from "./TransactionList";

function Sidebar({
  address,
  safeName,
  setHandleCreateTxnComponent,
  handleCreateTxnComponent,
}) {
  return (
    <div className="h-screen w-1/6 bg-gradient-to-b from-gray-900 via-slate-950 to-slate-900 shadow-blue-900 shadow-sm  p-3 px-4 rounded-r-2xl flex flex-col items-center justify-between">
      <SafeAccountInfo address={address} safeName={safeName} />
      <TransactionList address={address} />
      <button
        onClick={() => setHandleCreateTxnComponent(!handleCreateTxnComponent)}
        className="bg-slate-900 p-2 md:p-3 my-2 rounded-lg text-gray-200 text-sm font-bold shadow-sm shadow-slate-600 hover:bg-blue-200 hover:scale-110 transition ease-in-out duration-200 active:bg-blue-100 "
      >
        Create Transaction
      </button>
    </div>
  );
}

export default Sidebar;
