import { createSlice } from "@reduxjs/toolkit";
import { Modal1State } from "../types/DASHBOARD";

export const modal1Slice = createSlice({
    name: "modal1",
    initialState: {
        value: {
            show: false,
            info: {
                title: "Algo sucedió mal",
                subtitle: "Vuelva a intentar",
                icon: "info",
                acceptButtonText: "",
                cancelButtonText: "",
                showCancelButton: false,
            },
            isAccepted: false,
            isCanceled: false
        } as Modal1State
    },
    reducers: {
        showModal1: (state, action: { payload: Modal1State }) => {
            state.value = {
                show: false,
                info: {
                    title: "Algo sucedió mal",
                    subtitle: "Vuelva a intentar",
                    icon: "info",
                    acceptButtonText: "",
                    cancelButtonText: "",
                    showCancelButton: false,
                },
                isAccepted: false,
                isCanceled: false
            };
            state.value = {...state.value, ...action.payload};
        },
        closeModal1: (state) => {
            state.value.isAccepted = false;
            state.value.isCanceled = false;
            state.value.show = false;               
        },
    },
});

export const { showModal1, closeModal1 } = modal1Slice.actions;
export default modal1Slice.reducer; 