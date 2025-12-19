import { Database_CustomResponse } from "../types/database";

export const checkCart = async (data: {userEmail: string}): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/checkCart?userEmail=${data.userEmail}`, {
            method: "get",
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