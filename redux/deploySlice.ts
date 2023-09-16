import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers, Wallet } from 'ethers';
import AAArtifact from "../contractABIs/AAFactory.json";
import ContractDeployerArtifact from "../contractABIs/ContractDeployer.json";

const guardianStorageBytecodeHash = "0x0100018dff71995123c2038837d1d2514a572c8101e07144590c6d73570aed8b";
const socialRecoveryModuleBytecodeHash = "0x01000a211886d67c075548275a211c6c17133b18967a86d828327ee59832e8a0";

const contractDeployerAddress = "0x0000000000000000000000000000000000008006";
const aaFactoryAddress = "0x08dD11bb40eCCafD53b40c69379Bc44B26267a3C";

interface deployments {
    guardianAddress: string;
    socialRecoveryAddress: string;
    safeAddress: string;
}

export const initialState: deployments = {
    guardianAddress: "",
    socialRecoveryAddress: "",
    safeAddress: ""
}

export const deployAll = createAsyncThunk(
    "deploy/contracts",
    async (owners: (string | null)[]) => {
        console.log(owners)
        if (window.ethereum) {
            const salt = ethers.constants.HashZero;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractDeployer = new ethers.Contract(contractDeployerAddress, ContractDeployerArtifact.abi, signer);
            let guardian = "";
            let social = "";
            let safeAccountAddress = "";


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
                // const owner1 = "0x9E5211cF1AD3D3BF1A5159EF29E8810b413383b0";
                // const owner2 = "0xF4481CA047E47B47a7677A27ed9C1157c10d27Fb";


                const createAccounts = await aaFactory.deployAccount(salt, owners, "2", {
                    gasLimit: 5000000
                });
                const createAccountsReceipt = await createAccounts.wait();
                safeAccountAddress = createAccountsReceipt.contractAddress;
                console.log(`Accounts - [${owners[0]} and ${owners[1]}] deployed using aaFactory contract at the address - ${safeAccountAddress}`);
                alert(`Accounts - [${owners[0]} and ${owners[1]}] deployed using aaFactory contract at the address - ${safeAccountAddress}`);

            } catch (error) {
                console.log("Error deploying accounts - ", error)

            }
            return { guardian, social, safeAccountAddress };

        }
    }
);

const deploySlice = createSlice({
    name: "deploySlice",
    initialState,
    reducers: {},
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

export default deploySlice.reducer;