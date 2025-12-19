import { Database_CustomResponse } from "../types/DASHBOARD/database"; 

export const enabledUserNotification = async (data: {email: string, name: string, lastName: string}): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/usersNotifications/enabledUser?email=${data.email}&name=${data.name}&lastName=${data.lastName}`,{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("dashtoken")}`,
            }
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error al conectarse a la API: ${message}`, data: null};
    }
};

export const productDisabledNotification = async (productID: number): Promise <Database_CustomResponse> => {
    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/productDisabled?productID=${productID}`,{
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("dashtoken")}`,
            }
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error al conectarse a la API: ${message}`, data: null};
    }
};
