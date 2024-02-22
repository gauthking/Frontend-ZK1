import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Web3Auth } from "@web3auth/modal";
import RPC from "../utils/web3RPC";
import { ethers } from 'ethers';
import { store } from './store';

declare global {
    interface Window {
        ethereum?: any
    }
}

interface ConnectState {
    isLoggedIn: boolean;
    address: string | null | undefined;
    connectLoader: boolean;
    provider: any;
    web3Auth: Web3Auth | null;
    pkey: string | null;
    eoaBalanceETH: string
}

const initialState: ConnectState = {
    isLoggedIn: false,
    address: null,
    connectLoader: false,
    provider: null,
    web3Auth: null,
    pkey: null,
    eoaBalanceETH: ""
};

// export const connectWallet = createAsyncThunk(
//     'wallet/connectWallet',
//     async () => {
//         try {
//             if (window.ethereum) {
//                 const accounts = await window.ethereum.request({
//                     method: "eth_requestAccounts",
//                 });

//                 if (accounts.length > 0) {
//                     return accounts[0];
//                 }

//                 return null;

//             } else {
//                 alert("Metamask not installed!")
//             }
//         } catch (error) {
//             console.error("Error requesting accounts:", error);
//             throw error;
//         }
//     }
// );

export const transferETHToEOA = createAsyncThunk(
    "transfer/transferETHtoEoa",
    async (privKey: any) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider("https://testnet.era.zksync.dev")
            const whale_pkey: any = process.env.NEXT_PUBLIC_WHALE_PRIV_KEY;
            const wallet = new ethers.Wallet(privKey);
            const whale_signer = new ethers.Wallet(
                whale_pkey,
                provider
            );
            const tx = {
                from: "0x527c52C431B6D4b3D5c346Dad4BfC144d06Dc9cf",
                to: wallet.address,
                value: ethers.utils.parseEther("0.02"),
                nonce: provider.getTransactionCount(
                    "0x527c52C431B6D4b3D5c346Dad4BfC144d06Dc9cf",
                    "latest"
                ),
                gasLimit: ethers.utils.hexlify(2000000), // 100000
                gasPrice: await provider.getGasPrice(),
            };
            await whale_signer.sendTransaction(tx).then((txn) => {
                console.log("sent funds");
            });
        } catch (error) {
            alert("An error occured while transferring the funds from whale wallet")
        }
    }
)

export const getPrivateKey = createAsyncThunk(
    'getPrivateKey/privateKey',
    async (provider: any) => {
        const rpc = new RPC(provider);
        console.log("rpc - ", rpc)
        const privateKey = await rpc.getPrivateKey();
        return privateKey;
    }
)

export const getPublicKey = createAsyncThunk(
    'getPublicKey/publicKey',
    async (provider: any) => {
        const rpc = new RPC(provider);
        const publicKey = await rpc.getAccounts();
        return publicKey[0];
    }
)

export const checkETHEOABalance = createAsyncThunk(
    'eoa/eoaBalance',
    async (provider: any) => {
        const rpc = new RPC(provider);
        const balance = await rpc.getBalance();
        return balance;
    }
)


const EOAslice = createSlice({
    name: 'eoaConnect',
    initialState,
    reducers: {
        setIsLoggedIn: (state, action) => {
            state.isLoggedIn = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        setConnectLoader: (state, action) => {
            state.connectLoader = action.payload;
        },
        setWProvider: (state, action) => {
            state.provider = action.payload;
        },
        setWeb3Auth: (state, action) => {
            state.web3Auth = action.payload;
        },

    },
    extraReducers(builder) {
        builder.addCase(getPrivateKey.fulfilled, (state, action) => {
            console.log(action.payload)
            if (action.payload) {
                state.pkey = action.payload
                console.log("private ky stored")
            }
        });
        builder.addCase(getPublicKey.fulfilled, (state, action) => {
            console.log(action.payload)
            if (action.payload) {
                state.address = action.payload
                console.log("pub ky stored")
            }
        })
        builder.addCase(checkETHEOABalance.fulfilled, (state, action) => {
            console.log(action.payload)
            if (action.payload) {
                state.eoaBalanceETH = action.payload
                console.log("pub ky stored")
            }
        });
    },
});


export const { setIsLoggedIn, setAddress, setConnectLoader, setWProvider, setWeb3Auth } = EOAslice.actions;

export default EOAslice.reducer;
