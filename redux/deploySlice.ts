import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import AAArtifact from "../contractABIs/AAFactory.json";
import ContractDeployerArtifact from "../contractABIs/ContractDeployer.json";
import { store } from './store';

const guardianStorageBytecodeHash = process.env.NEXT_PUBLIC_GUARDIANSTORAGEBYTECODEHASH;
const socialRecoveryModuleBytecodeHash = process.env.NEXT_PUBLIC_SCRBYTECODEHASH;

const contractDeployerAddress: any = process.env.NEXT_PUBLIC_CONTRACTDEPLOYERADDRESS;
const aaFactoryAddress: any = process.env.NEXT_PUBLIC_AAFACTORYADDRESS;

interface deployments {
    guardianAddress: string;
    socialRecoveryAddress: string;
    safeAddress: string;
    threshold: string;
}

export const initialState: deployments = {
    guardianAddress: "",
    socialRecoveryAddress: "",
    safeAddress: "",
    threshold: ""
}

export const deployAll = createAsyncThunk(
    "deploy/contracts",
    async (owners: (string | null)[]) => {
        console.log(owners)
        const salt = ethers.constants.HashZero;
        const provider = new ethers.providers.JsonRpcProvider("https://testnet.era.zksync.dev");
        const wallet_pkey: any = store.getState().eoaConnect.pkey
        const wallet = new ethers.Wallet(wallet_pkey);
        const signer = wallet.connect(provider);
        const balance = await provider.getBalance(wallet.address);
        const minBalance = ethers.utils.parseEther("0.002");
        if (balance.lt(minBalance)) {
            const confirmTransfer = window.confirm(
                "Your wallet balance is below 0.002 ETH. Do you want to transfer some funds from a WHALE wallet?"
            );
            if (confirmTransfer) {
                const whale_pkey: any = process.env.NEXT_PUBLIC_WHALE_PRIV_KEY;
                const whale_signer = new ethers.Wallet(
                    whale_pkey,
                    provider
                );
                console.log(whale_signer)
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
                    alert("Funds have been sent to the smart account");
                });
            } else {
                // User declined transfer
                throw new Error("Insufficient balance for deployment");
            }
        }
        const contractDeployer = new ethers.Contract(contractDeployerAddress, ContractDeployerArtifact.abi, signer);
        let guardian = "";
        let social = "";
        let safeAccountAddress = "";

        // first deploying guardianStorage contract
        try {
            const deployGuardianStorage = await contractDeployer.create(salt, guardianStorageBytecodeHash, "0x", {
                gasLimit: 2000000
            });
            const guardianReceipt = await deployGuardianStorage.wait();
            const guardianAddress = guardianReceipt.contractAddress;
            console.log(guardianAddress)
            guardian = guardianAddress;
            console.log("Guardian Storage Deployed to : ", guardianAddress);
        } catch (error) {
            console.log("Error deploying guardian storage contract - ", error)
        }

        // second .. deploying social recovery module
        try {
            const socialRecoveryConstructor = [guardian, "0"];
            const socialRecoveryConstructorData = ethers.utils.defaultAbiCoder.encode(['address', 'string'], socialRecoveryConstructor);
            const deploySocialRecovery = await contractDeployer.create(salt, socialRecoveryModuleBytecodeHash, socialRecoveryConstructorData, {
                gasLimit: 2000000
            });
            const socialRecoveryReceipt = await deploySocialRecovery.wait();
            const socialAddress = socialRecoveryReceipt.contractAddress;
            social = socialAddress;
            console.log("Social Recovery Module Deployed to : ", socialAddress);
        } catch (error) {
            console.log("Error deploying social recovery contract - ", error)
        }

        // third.. deploying accounts using AAFactory contract
        try {
            const aaFactory = new ethers.Contract(aaFactoryAddress, AAArtifact.abi, signer);
            // const owner1 = "0x9E5211cF1AD3D3BF1A5159EF29E8810b413383b0";
            // const owner2 = "0xF4481CA047E47B47a7677A27ed9C1157c10d27Fb";
            console.log("threshold", store.getState().deployContracts.threshold)
            const createAccounts = await aaFactory.deployAccount(salt, owners, store.getState().deployContracts.threshold, {
                gasLimit: 5000000
            });
            const createAccountsReceipt = await createAccounts.wait();
            safeAccountAddress = createAccountsReceipt.contractAddress;
            console.log(`Accounts - ${owners} deployed using aaFactory contract at the address - ${safeAccountAddress}`);
            alert(`Accounts - ${owners} deployed using aaFactory contract at the address - ${safeAccountAddress}`);
        } catch (error) {
            console.log("Error deploying accounts - ", error)
        }
        return { guardian, social, safeAccountAddress };
    }

);

const deploySlice = createSlice({
    name: "deploySlice",
    initialState,
    reducers: {
        setDeployThreshold: (state, action) => {
            state.threshold = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(deployAll.fulfilled, (state, action) => {
            console.log('Payload:', action.payload);
            if (action.payload) {
                state.safeAddress = action.payload.safeAccountAddress;
                state.guardianAddress = action.payload.guardian;
                state.socialRecoveryAddress = action.payload.social;
            }
        })
    }
})
export const { setDeployThreshold } = deploySlice.actions;

export default deploySlice.reducer;