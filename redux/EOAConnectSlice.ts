import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Web3Auth } from "@web3auth/modal";
import RPC from "../utils/web3RPC";

declare global {
    interface Window {
        ethereum?: any
    }
}

interface ConnectState {
    isLoggedIn: boolean;
    address: string | null;
    connectLoader: boolean;
    provider: any;
    web3Auth: Web3Auth | null;
    pkey: string | null;
}

const initialState: ConnectState = {
    isLoggedIn: false,
    address: null,
    connectLoader: false,
    provider: null,
    web3Auth: null,
    pkey: null
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

export const getPrivateKey = createAsyncThunk(
    'getPrivateKey/privateKey',
    async (provider: any) => {
        const rpc = new RPC(provider);
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
    },
});


export const { setIsLoggedIn, setAddress, setConnectLoader, setWProvider, setWeb3Auth } = EOAslice.actions;

export default EOAslice.reducer;
