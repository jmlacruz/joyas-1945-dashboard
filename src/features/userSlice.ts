import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SessionUserData } from "../types";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        value: {
            email: "", 
            name: "",
            lastName: "",
            registered: false,
            rememberme: false,
            isAdmin: false,
            streamChatToken: "",
            userId: "",
            city: "",
            dolar: false,
            token: "",
        } as SessionUserData
    },
    reducers: {
        setUser: (state, {payload: sessionUserData}: PayloadAction<SessionUserData>) => {
            state.value = sessionUserData;
        },
        clearUser: (state) => {
            state.value = {
                email: "",
                name: "",
                lastName: "",
                registered: false,
                rememberme: false,
                isAdmin: false,
                streamChatToken: "",
                userId: "",
                city: "",
                dolar: false,
                token: "",
            };
        }
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 