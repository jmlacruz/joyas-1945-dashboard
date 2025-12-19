import { tablesForNotParseDateFields } from "../data";
import { Database_CustomResponse, FilterOrderByTypes, NewProductsOrderArr, UsersLogsOrigins } from "../types/DASHBOARD/database";
import { isValidNoEmptyArray, parseDateFields } from "../utils/utils";

// Base URL tomada del .env de Vercel (Dashboard)
const API_BASE = process.env.REACT_APP_API_URL || "";

// Arma headers y SOLO agrega Authorization si hay token
const withAuth = (extra: Record<string, string> = {}) => {
  const token = localStorage.getItem("dashtoken");
  const headers: Record<string, string> = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const getProductsFiltered = async (options: {
  limit: number,
  offset: number,
  fields: string[],
  condition?: { field: string, operator: string, value: string | number },
  searchWordsArr: string[],
  categoriesIdsArr: number[],
  priceRangeArr: number[],
  orderBy: FilterOrderByTypes,
  brand: string | number,
}): Promise<Database_CustomResponse> => {
  try {
    const fieldsJSON = JSON.stringify(options.fields);
    const conditionJSON = options.condition ? JSON.stringify(options.condition) : "";
    const searchWordsJSON = options.searchWordsArr && options.searchWordsArr.length && Array.isArray(options.searchWordsArr) ? JSON.stringify(options.searchWordsArr) : JSON.stringify([]);
    const categoriesIdsArrJSON = options.categoriesIdsArr && options.categoriesIdsArr.length && Array.isArray(options.categoriesIdsArr) ? JSON.stringify(options.categoriesIdsArr) : JSON.stringify([]);
    const priceRangeArrJSON = options.priceRangeArr && options.priceRangeArr.length && Array.isArray(options.priceRangeArr) ? JSON.stringify(options.priceRangeArr) : JSON.stringify([]);

    const responseJSON = await fetch(
      `${API_BASE}/db/getProductsFiltered?limit=${options.limit}&fields=${fieldsJSON}&offset=${options.offset}&condition=${conditionJSON}&searchWords=${searchWordsJSON}&categories=${categoriesIdsArrJSON}&priceRange=${priceRangeArrJSON}&orderBy=${options.orderBy}&brand=${options.brand}`,
      { method: "GET", headers: withAuth() }
    );

    const responseOBJ = await responseJSON.json();
    parseDateFields(responseOBJ.data as object[]);
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const getProductsFilteredRowsQuantity = async (options: {
  condition?: { field: string, operator: string, value: string | number },
  searchWordsArr: string[],
  categoriesIdsArr: number[],
  priceRangeArr: number[],
  brand: string,
}): Promise<Database_CustomResponse> => {
  const conditionJSON = options.condition ? JSON.stringify(options.condition) : "";
  const searchWordsJSON = options.searchWordsArr && options.searchWordsArr.length && Array.isArray(options.searchWordsArr) ? JSON.stringify(options.searchWordsArr) : JSON.stringify([]);
  const categoriesIdsArrJSON = options.categoriesIdsArr && options.categoriesIdsArr.length && Array.isArray(options.categoriesIdsArr) ? JSON.stringify(options.categoriesIdsArr) : JSON.stringify([]);
  const priceRangeArrJSON = options.priceRangeArr && options.priceRangeArr.length && Array.isArray(options.priceRangeArr) ? JSON.stringify(options.priceRangeArr) : JSON.stringify([]);

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/getProductsFilteredRowsQuantity?condition=${conditionJSON}&searchWords=${searchWordsJSON}&categories=${categoriesIdsArrJSON}&priceRange=${priceRangeArrJSON}&brand=${options.brand}`,
      { method: "GET", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const getTable = async (options: {
  tableName: string,
  fields?: string[],
  conditions?: { field: string, value: string | number }[],
  limit?: number,
  offset?: number,
  orderBy?: { field: string, order: "asc" | "desc" },
  count?: boolean
}): Promise<Database_CustomResponse> => {
  const conditionsJSON = options.conditions ? JSON.stringify(options.conditions) : "";
  const fieldsArrJSON = isValidNoEmptyArray(options.fields) ? JSON.stringify(options.fields) : "";
  const countJSON = options.count === false || options.count === true ? JSON.stringify(options.count) : "";
  const limitStr = typeof options.limit === "number" ? options.limit.toString() : "";
  const offsetStr = typeof options.offset === "number" ? options.offset.toString() : "";
  const orderByJSON = options.orderBy ? JSON.stringify(options.orderBy) : "";

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/getTable?tableName=${options.tableName}&fields=${fieldsArrJSON}&condition=${conditionsJSON}&count=${countJSON}&offset=${offsetStr}&limit=${limitStr}&orderBy=${orderByJSON}`,
      { method: "GET", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    if (responseOBJ.data && typeof responseOBJ.data === "object" && !tablesForNotParseDateFields.includes(options.tableName)) {
      parseDateFields(responseOBJ.data as object[]);
    }
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const getProductByID = async (productID: number): Promise<Database_CustomResponse> => {
  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/getProductByID?id=${productID}`,
      { method: "GET", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const getProductsByIDs = async (options: { iDsArr: number[], fieldsArr: string[] }): Promise<Database_CustomResponse> => {
  const iDsArrJSON = isValidNoEmptyArray(options.iDsArr) ? JSON.stringify(options.iDsArr) : JSON.stringify([]);
  const fieldsArrJSON = isValidNoEmptyArray(options.fieldsArr) ? JSON.stringify(options.fieldsArr) : JSON.stringify([]);

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/getProductsByIDs?ids=${iDsArrJSON}&fileds=${fieldsArrJSON}`,
      { method: "GET", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const updateTable = async (options: { tableName: string, conditions: { field: string, value: string | number }[], data: any }): Promise<Database_CustomResponse> => {
  const conditionJSON = options.conditions ? JSON.stringify(options.conditions) : "";

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/updateTable?tableName=${options.tableName}&condition=${conditionJSON}`,
      { method: "PUT", body: JSON.stringify(options.data), headers: withAuth({ "Content-Type": "application/json" }) }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const updateProductsOrder = async (options: { newProductsOrderArr: NewProductsOrderArr }): Promise<Database_CustomResponse> => {
  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/updateProductsOrder`,
      { method: "PUT", body: JSON.stringify(options.newProductsOrderArr), headers: withAuth({ "Content-Type": "application/json" }) }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const insertRow = async (options: { tableName: string, data: any }): Promise<Database_CustomResponse> => {
  if (!options.tableName || typeof options.tableName !== "string") options.tableName = "";
  if (!options.data || typeof options.data !== "object") options.data = {};

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/insertRow?tableName=${options.tableName}`,
      { method: "POST", body: JSON.stringify(options.data), headers: withAuth({ "Content-Type": "application/json" }) }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const deleteRowByID = async (options: { tableName: string, rowID: number }): Promise<Database_CustomResponse> => {
  if (!options.tableName || typeof options.tableName !== "string") options.tableName = "";
  if (!options.rowID || typeof options.rowID !== "number") options.rowID = -1;

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/deleteRowByID?tableName=${options.tableName}&rowID=${options.rowID}`,
      { method: "DELETE", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const deleteRows = async (options: { tableName: string, conditions: { field: string, value: string | number }[] }): Promise<Database_CustomResponse> => {
  const { tableName, conditions } = options;
  const tableNameSatinized = tableName && typeof tableName === "string" ? tableName : "";
  const conditionsJSON = Array.isArray(conditions) ? JSON.stringify(conditions) : JSON.stringify([]);

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/deleteRows?tableName=${tableNameSatinized}&conditions=${conditionsJSON}`,
      { method: "DELETE", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const usersLogs = async (data: {
  userIP: string,
  deviceInfo: string,
  device: string,
  loginError?: { email: string, password: string },
  origin: UsersLogsOrigins
}): Promise<Database_CustomResponse> => {
  const { userIP, deviceInfo, device, loginError, origin } = data;
  const logEndPoint = loginError ? "loginError" : "usersLogs";

  try {
    const responseJSON = await fetch(
      `${API_BASE}/db/${logEndPoint}`,
      { method: "POST", body: JSON.stringify({ userIP, deviceInfo, device, loginError, origin }), headers: withAuth({ "Content-Type": "application/json" }) }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};

export const updateGoogleReviews = async (): Promise<Database_CustomResponse> => {
  try {
    const responseJSON = await fetch(
      `${API_BASE}/getReviews`,
      { method: "GET", headers: withAuth() }
    );
    const responseOBJ = await responseJSON.json();
    return responseOBJ;
  } catch (err) {
    const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
    return { success: false, message: `Error al conectarse a la base de Datos: ${message}`, data: null };
  }
};
