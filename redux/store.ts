import { configureStore } from "@reduxjs/toolkit";
import eoaReducer from "./EOAConnectSlice"
import deployReducer from "./deploySlice"
import guardianSlice from "./guardianSlice";

export function createStore() {
    return configureStore({
        reducer: {
            eoaConnect: eoaReducer,
            deployContracts: deployReducer,
            scrContract: guardianSlice
        }
    })
}

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch