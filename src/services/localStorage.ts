import { SessionUserData } from "../types/DASHBOARD";
import { isValidJSON } from "../utils/utils";

export const saveSessionDataInLocalStorage = (sessionData: SessionUserData) => localStorage.setItem("sessionData-dash", JSON.stringify(sessionData));

export const getSessionOfLocalStorage = () : SessionUserData | null => {
    const storageData = localStorage.getItem("sessionData-dash");
    if (storageData && isValidJSON(storageData)) {
        return JSON.parse(storageData);
    }
    return null;
};

export const clearSessionOfLocalStorage = () => localStorage.removeItem("sessionData-dash");