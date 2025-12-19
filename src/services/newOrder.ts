import { OrderData } from "../types";
import { Database_CustomResponse } from "../types/database";

export const newOrder = async (data: {orderHTML: string, orderCSS: string, orderData: OrderData}): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/newOrder`,{
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("webtoken")}`,
            },
            credentials: "include"
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error al conectarse a la API: ${message}`, data: null};
    }
};