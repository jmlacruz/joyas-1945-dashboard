import { Firebase_CustomResponse } from "../types/DASHBOARD/database";

export const uploadFiles = async (formData: FormData, resizeImage?: boolean): Promise<Firebase_CustomResponse> => {
    try {

        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/uploadFiles?resizeImage=${resizeImage === undefined ? true : resizeImage}`, {            //Por defecto las imagenes se redimensionan si tienen mas de 1000px de ancho
            method: 'POST',                                                                                                                                         // a menos que "resizeImage === false" y ahi no se redimensionan (Por ejemplo si estamos pasando una imagen de portada)
            body: formData,
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

export const deleteFiles = async (fileName: string): Promise<Firebase_CustomResponse> => {
    try {

        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/deleteFiles?fileName=${fileName}`, {
            method: 'GET',
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

export const uploadDocument = async (formData: FormData): Promise<Firebase_CustomResponse> => {
    try {

        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/uploadDocument`, {            //Por defecto las imagenes se redimensionan si tienen mas de 1000px de ancho
            method: 'POST',                                                                                                                                         // a menos que "resizeImage === false" y ahi no se redimensionan (Por ejemplo si estamos pasando una imagen de portada)
            body: formData,
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

export const deleteDocument = async (documentName: string): Promise<Firebase_CustomResponse> => {
    try {

        const responseJSON = await fetch(`${process.env.REACT_APP_API_URL}/deleteDocument?documentName=${documentName}`, {
            method: 'GET',
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