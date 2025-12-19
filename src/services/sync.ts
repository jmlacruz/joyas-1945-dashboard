import { Database_CustomResponse } from "../types/DASHBOARD/database";

export const syncProducts = async (): Promise <Database_CustomResponse> => {
    const responseJSON = await fetch (`${process.env.REACT_APP_API_URL}/syncData`, {
        method: "GET",
        headers: {
            "Authorization": `Basic ${process.env.REACT_APP_SYNC_DATA_ENDPOINT_PASSWORD}`,
        },
    });
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
};