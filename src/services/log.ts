import { LogControllers_CustomResponse, LoginData } from "../types";

export const loginUser = async (loginData: LoginData) : Promise <LogControllers_CustomResponse> => {

    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(loginData),
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error de inicio de sesión: ${message}`, data: null};
    }
};

export const isLogged = async (options?: {refreshData: boolean, retryCount?: number}) : Promise <LogControllers_CustomResponse> => {
    const maxRetries = 2;
    const retryCount = options?.retryCount || 0;

    try {
        const token = localStorage.getItem("webtoken");
        
        // Si no hay token, no está logueado
        if (!token) {
            return {success: false, message: "No hay token de autenticación", data: null};
        }

        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/isLogged?refreshData=${options && options?.refreshData}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            // Timeout de 10 segundos
            signal: AbortSignal.timeout(1000)
        });

        // Si la respuesta no es ok, pero es un error del servidor (no de red)
        if (!responseJSON.ok) {
            if (responseJSON.status === 401 || responseJSON.status === 403) {
                // Token inválido o expirado
                return {success: false, message: "Token inválido o expirado", data: null};
            }
            // Otros errores del servidor - podrían ser temporales
            if (retryCount < maxRetries) {
                console.warn(`Error del servidor al verificar login (${responseJSON.status}), reintentando...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return isLogged({refreshData: options?.refreshData || false, retryCount: retryCount + 1});
            }
            return {success: false, message: `Error del servidor: ${responseJSON.status}`, data: null};
        }

        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        // Distinguir entre errores de red y otros errores
        if (err instanceof Error) {
            const isNetworkError = err.name === "NetworkError" || 
                                 err.name === "TypeError" || 
                                 err.message.includes("fetch") ||
                                 err.message.includes("network") ||
                                 err.message.includes("timeout") ||
                                 err.name === "TimeoutError";

            if (isNetworkError && retryCount < maxRetries) {
                console.warn(`Error de red al verificar login, reintentando... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
                return isLogged({refreshData: options?.refreshData || false, retryCount: retryCount + 1});
            }

            if (isNetworkError) {
                // Después de agotar reintentos, mantener la sesión local
                console.warn("Error de red persistente, manteniendo sesión local");
                return {success: true, message: "Sesión mantenida localmente por error de red", data: null};
            }
        }

        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error de verificación de login: ${message}`, data: null};
    }
};

export const logOut = async () : Promise <LogControllers_CustomResponse> => {

    try {
        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/logOut`, {
            method: "POST",
            credentials: "include",
        });
        const responseOBJ = await responseJSON.json();
        return responseOBJ;

    } catch (err) {
        const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
        return {success: false, message: `Error al cerrar sesión: ${message}`, data: null};
    }
};