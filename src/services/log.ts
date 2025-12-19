import { LogControllers_CustomResponse, LoginData } from "../types/DASHBOARD";

const API_BASE = process.env.REACT_APP_API_URL || "";

// agrega Authorization solo si existe token
const authHeaders = (extra: Record<string, string> = {}) => {
  const token = localStorage.getItem("dashtoken");
  const headers: Record<string, string> = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const loginUser = async (loginData: LoginData): Promise<LogControllers_CustomResponse> => {
  try {
    const responseJSON = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // <-- SIN Authorization
      body: JSON.stringify(loginData),
    });

    const responseOBJ = await responseJSON.json();

    // si la API devuelve token, lo guardamos para las siguientes requests
    const token = responseOBJ?.token ?? responseOBJ?.data?.token;
    if (token) localStorage.setItem("dashtoken", token);

    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error de inicio de sesión: ${message}`, data: null };
  }
};

export const isLogged = async (options?: { refreshData: boolean }): Promise<LogControllers_CustomResponse> => {
  try {
    const url = `${API_BASE}/isLogged?refreshData=${!!options?.refreshData}`;
    const responseJSON = await fetch(url, {
      method: "POST",
      headers: authHeaders(), // <-- aquí sí va Authorization si existe token
    });
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error de verificación de login: ${message}`, data: null };
  }
};

export const logOut = async (): Promise<LogControllers_CustomResponse> => {
  try {
    const responseJSON = await fetch(`${API_BASE}/logOut`, {
      method: "POST",
      headers: authHeaders(), // <-- aquí también
    });
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al cerrar sesión: ${message}`, data: null };
  }
};
