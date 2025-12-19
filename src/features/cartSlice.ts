import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartData } from "../types";

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        value: {
            cartItems: [],
            generalObservation: ""
        } as CartData,
    },
    reducers: {
        addToCart: (state, {payload: productID}: PayloadAction<number>) => {                                              
            const itemExist = state.value.cartItems.find((item) => item.itemId === productID);
            if (itemExist) {
                itemExist.quantity += 1;
            } else {
                state.value.cartItems.push({itemId: productID, quantity: 1});
            }
        },
        subtractToCart: (state, {payload: productID}: PayloadAction<number>) => {
            const itemExist = state.value.cartItems.find((item) => item.itemId === productID);
            if (itemExist && itemExist.quantity > 1) {
                itemExist.quantity -= 1;
            } else if (itemExist && itemExist.quantity === 1) {
                const indexToDelete = state.value.cartItems.findIndex((item) => item.itemId === productID);
                state.value.cartItems.splice(indexToDelete, 1);
            }
        },
        replaceToCart: (state, {payload: productData}: PayloadAction<{itemId: number, quantity: number}>) => {                                              
            const itemExist = state.value.cartItems.find((item) => item.itemId === productData.itemId);
            if (itemExist) {
                itemExist.quantity = productData.quantity;
            } else {
                state.value.cartItems.push({itemId: productData.itemId, quantity: productData.quantity});
            }
        },
        deleteItem: (state, {payload: productID}: PayloadAction<number>) => {
            const indexToDelete = state.value.cartItems.findIndex((item) => item.itemId === productID);
            state.value.cartItems.splice(indexToDelete, 1);
        },
        clearCart: (state) => {
            state.value.cartItems.length = 0;
            state.value.generalObservation = "";    
        },
        updateCart: (state, {payload}: PayloadAction<CartData>) => {
            const cartData: CartData = payload;
            state.value = cartData;     
        },
        addOrEditObservation: (state, {payload: itemData}: PayloadAction<{itemId: number, observation: string}>) => {
            const itemExist = state.value.cartItems.find((item) => item.itemId === itemData.itemId);
            if (itemExist) {
                itemExist.observation = itemData.observation;
            } 
        },
        addOrEditGeneralObservation: (state, {payload: generalObservation}: PayloadAction<string>) => {
            state.value.generalObservation = generalObservation;
        },
    },
}); 

export const { addToCart, subtractToCart, deleteItem, clearCart, updateCart, replaceToCart, addOrEditObservation, addOrEditGeneralObservation} = cartSlice.actions;
export default cartSlice.reducer;