import { configureStore } from "@reduxjs/toolkit";
import eoaReducer from "./EOAConnectSlice"
import deployReducer from "./deploySlice"

export function createStore() {
    return configureStore({
        reducer: {
            eoaConnect: eoaReducer,
            deployContracts: deployReducer
        }
    })
}

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch