import { createSlice } from "@reduxjs/toolkit";
import { SessionUserData } from "../types/DASHBOARD";

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
            city: "",
            streamChatToken: "",
            userId: "",
            token: "",
        } as SessionUserData
    },
    reducers: {
        setUser: (state, {payload}) => {
            state.value = payload as SessionUserData;
        },
        clearUser: (state) => {
            state.value = {
                email: "",
                name: "",
                lastName: "",
                registered: false,
                rememberme: false,
                isAdmin: false,
                city: "",
                streamChatToken: "",
                userId: "",
                token: "",
            };
        }
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 