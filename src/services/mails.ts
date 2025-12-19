import { ContactFormValues } from "../types";
import { Database_CustomResponse, Usuario } from "../types/database";

export const newRegister = async (data: Partial<Usuario>): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/newRegister`,{
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

export const newContact = async (data: ContactFormValues): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/newContact`,{
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

export const sendPassword = async (email: string): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/recoveryPassword?email=${email}`,{
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("webtoken")}`,
            }
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error al conectarse a la API: ${message}`, data: null};
    }
};