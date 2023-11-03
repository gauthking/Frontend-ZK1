"use client";
import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const networks = [
  { chainId: 324, name: "zkSync Era Mainnet", avatarColor: "bg-green-300" },
  { chainId: 280, name: "zkSync Era Testnet", avatarColor: "bg-yellow-300" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Dropdown({ setNetwork }: any) {
  const [selected, setSelected] = useState(networks[0]);

  useEffect(() => {
    setNetwork(networks[0].name);
  }, []);

  const setNetworks = (network: any) => {
    setSelected(network);
    setNetwork(network.name);
    console.log(selected);
  };

  return (
    <Listbox value={selected} onChange={setNetworks}>
      {({ open }) => (
        <>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-100 shadow-sm  sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <div
                  className={`h-5 w-5 rounded-full ${selected.avatarColor}`}
                ></div>
                <span className="ml-3 block truncate">{selected.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {networks.map((network, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-gray-600 text-white" : "text-white",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={network}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full ${network.avatarColor}`}
                          ></div>
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {network.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
