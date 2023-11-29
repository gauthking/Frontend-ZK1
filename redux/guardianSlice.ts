import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import axios from "../app/axios";
import SocialRecoveryModuleArtifact from "../contractABIs/SocialRecoveryModule.json"
import { Provider } from 'zksync-web3';
import { ethers } from 'ethers';

interface guardianTypes {
    guardianAddress: string;
    guardianThreshold: string;
};

export const initialState: guardianTypes = {
    guardianAddress: "",
    guardianThreshold: ""
}

export const addGuardianWithThreshold = createAsyncThunk(
    "scr/addGuardianCall",
    async (smartAccountAddress: string) => {
        try {
            const getAccount = await axios.get(`/api/account/${smartAccountAddress}`);
            console.log("getAccount", getAccount);

            const provider = new Provider("https://zksync2-testnet.zksync.dev");

            const scrAddress = getAccount.data.socialRecoveryModuleAddress;
            console.log(scrAddress)
            const scContractABI = SocialRecoveryModuleArtifact.abi;

            const wallet_pkey: any = store.getState().eoaConnect.pkey
            console.log(wallet_pkey)
            const wallet = new ethers.Wallet(wallet_pkey);
            const signer = wallet.connect(provider);

            const scrContract = new ethers.Contract(scrAddress, scContractABI, signer)
            console.log(store.getState().scrContract.guardianAddress, parseInt(store.getState().scrContract.guardianThreshold), smartAccountAddress)

            const addGuardian = await scrContract.addGuardianWithThreshold(smartAccountAddress, store.getState().scrContract.guardianAddress, store.getState().scrContract.guardianThreshold, {
                gasLimit: 2000000
            })
            // const txnReceipt = await addGuardian.wait();

            console.log("txnReceipt - ", addGuardian)
            alert("gurdian added sucessfully")

        } catch (error) {
            console.log("an err occured while calling addguardian - ", error)
        }
    }
)

const guardianSlice = createSlice({
    name: "guardianSlice",
    initialState,
    reducers: {
        setGuardianAddress: (state, action) => {
            state.guardianAddress = action.payload;
            console.log("guardian address set")
        },
        setGuardianThreshold: (state, action) => {
            state.guardianThreshold = action.payload;
            console.log("guardian threshold set")
        }
    }
})

export const { setGuardianAddress, setGuardianThreshold } = guardianSlice.actions
export default guardianSlice.reducer;