"use client";

import React, { useState } from "react";

function SafeAccountInfo({ address, safeName }) {
  const safe = address;
  const [slicedAddress, setSlicedAddress] = useState(safe.slice(0, 12) + "...");
  const handleHoverAddress = () => {
    setSlicedAddress(safe);
  };
  return (
    <div className="flex gap-10 items-center justify-center z-10 border-b-2 rounded-xl px-2 border-opacity-5 border-blue-50 py-4">
      <div className="image">
        <img
          src="https://cdn-icons-png.flaticon.com/128/1177/1177568.png"
          alt="walleticon"
          className="h-10 w-10 "
        />
      </div>
      <div
        onMouseOver={() => handleHoverAddress()}
        onMouseLeave={() => setSlicedAddress(safe.slice(0, 12) + "...")}
        className="flex flex-col hover:absolute hover:scale-105 hover:ml-36 hover:bg-gray-900 hover:p-5 hover:rounded-xl hover:shadow-sm transition-all ease-in-out z-20"
      >
        <p className="safeName font-kanit_bold text-yellow-50 text-sm -mb-1 ">
          {safeName}
        </p>
        <p
          id="safeAddress"
          className="safeAddress font-mono text-yellow-50 text-xs transition-all ease-in-out "
        >
          {slicedAddress}
        </p>
      </div>
    </div>
  );
}

export default SafeAccountInfo;
