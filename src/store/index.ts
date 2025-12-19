import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "../features/userSlice";
import cartReducer from "../features/cartSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType <typeof store.getState>;
setupListeners(store.dispatch);
export default store;
