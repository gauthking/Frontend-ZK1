import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers, Wallet } from 'ethers';
import guardianStorageArtifact from "../contractABIs/GuardianStorage.json";
import AAArtifact from "../contractABIs/AAFactory.json";
import SocialRecoveyArtifact from "../contractABIs/SocialRecoveryModule.json";
import TwoUserMultisigArtifact from "../contractABIs/TwoUserMultiSig.json";
import ContractDeployerArtifact from "../contractABIs/ContractDeployer.json";

const guardianStorageBytecodeHash = "0x0100018dff71995123c2038837d1d2514a572c8101e07144590c6d73570aed8b";
const socialRecoveryModuleBytecodeHash = "0x01000a211886d67c075548275a211c6c17133b18967a86d828327ee59832e8a0";
const aaFactoryBytecodeHash = "0x0100008184a9600c91ed12da61e724081beb7fd0119af09a3f4eed8775a62f5d";

const contractDeployerAddress = "0x0000000000000000000000000000000000008006";
const aaFactoryAddress = "0xB1F79ff003E787e9bB6de4Bb9a845fbA09d06b80";

interface deployments {
    guardianAddress: string;
    socialRecoveryAddress: string;
    safeAddress: string;
}

const initialState: deployments = {
    guardianAddress: "",
    socialRecoveryAddress: "",
    safeAddress: ""
}

export const deployAll = createAsyncThunk(
    "deploy/contracts",
    async () => {
        if (window.ethereum) {
            const salt = ethers.constants.HashZero;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractDeployer = new ethers.Contract(contractDeployerAddress, ContractDeployerArtifact.abi, signer);
            let guardian = "";
            let social = "";

            try {
                // first deploying guardianStorage contract
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
                const owner1 = Wallet.createRandom();
                const owner2 = Wallet.createRandom();
                const createAccounts = await aaFactory.deployAccount(salt, [owner1.address, owner2.address], "2", {
                    gasLimit: 5000000
                });
                const createAccountsReceipt = await createAccounts.wait();
                const safeAccountAddress = createAccountsReceipt.contractAddress;
                console.log(`Accounts - [${owner1.address} and ${owner2.address}] deployed using aaFactory contract at the address - ${safeAccountAddress}`);
                alert(`Accounts - [${owner1.address} and ${owner2.address}] deployed using aaFactory contract at the address - ${safeAccountAddress}`);

                return { guardian, social, safeAccountAddress };
            } catch (error) {
                console.log("Error deploying accounts - ", error)

            }

        }
    }
)

const deploySlice = createSlice({
    name: "deploy",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(deployAll.fulfilled, (state, action) => {
            if (action.payload) {
                state.safeAddress = action.payload.safeAccountAddress;
                state.guardianAddress = action.payload.guardian;
                state.socialRecoveryAddress = action.payload.social;
            }
        })
    }
})

export default deploySlice.reducer;