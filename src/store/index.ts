import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "../features/userSlice";
import modal1Reducer  from "../features/modalSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        modal1: modal1Reducer,
    },
});

export type RootState = ReturnType <typeof store.getState>;
setupListeners(store.dispatch);
export default store;
