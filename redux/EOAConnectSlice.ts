import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any
    }
}

interface ConnectState {
    isConnected: boolean;
    address: string | null;
    connectLoader: boolean;
}

const initialState: ConnectState = {
    isConnected: false,
    address: null,
    connectLoader: false
};

export const connectWallet = createAsyncThunk(
    'wallet/connectWallet',
    async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });

                if (accounts.length > 0) {
                    return accounts[0];
                }

                return null;

            } else {
                alert("Metamask not installed!")
            }
        } catch (error) {
            console.error("Error requesting accounts:", error);
            throw error;
        }
    }
);

const EOAslice = createSlice({
    name: 'eoaConnect',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(connectWallet.fulfilled, (state, action) => {
            if (action.payload) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                state.address = action.payload;
                state.isConnected = true;
            }
        });
        // builder.addCase(connectWallet.pending, (state, action) => {
        //     if (action.payload) {
        //         const provider = new ethers.providers.Web3Provider(window.ethereum);
        //         const signer = provider.getSigner();
        //         state.address = action.payload;
        //         state.isConnected = true;
        //     }
        // });
    }
});


export default EOAslice.reducer;
