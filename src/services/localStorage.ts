import { SessionUserData } from "../types";
import { isValidJSON } from "../utils/utils";

export const saveSessionDataInLocalStorage = (sessionData: SessionUserData) => localStorage.setItem("sessionData-front", JSON.stringify(sessionData));

export const getSessionOfLocalStorage = () : SessionUserData | null => {
    const storageData = localStorage.getItem("sessionData-front");
    if (storageData && isValidJSON(storageData)) {
        return JSON.parse(storageData);
    }
    return null;
};

export const clearSessionOfLocalStorage = () => localStorage.removeItem("sessionData-front");