import ReactDOMServer from "react-dom/server";
import React from "react";
import { QuerysData, QuerysDataParsed } from "../types";
import { getTable } from "../services/database";
import { Categoria, FilterOrderByTypes, Marca } from "../types/database";
import { filterOrderByTypesEquivalences } from "../data";

export const isValidJSON = (dataJSON: string | null) => {
    if (!dataJSON) return false;
    try {
        JSON.parse(dataJSON);
        return true;
    } catch {
        return false;
    }
};

export const isValidNoEmptyArray = (array: any) => {
    return array && array.length && Array.isArray(array);
};

export function formatDateToSpanish (date: string) {
    const dateparsed = new Date(date);
    const months = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];
    
    const day = dateparsed.getDate();
    const month = months[dateparsed.getMonth()];
    const year = dateparsed.getFullYear();

    return `${day} DE ${month} DEL ${year}`;
}

export const showElement = (condition: boolean) => {                                    //Para usar esta función correctamente tenemos que tener una clase definida con nombre "elementToShow" y que tenga "opacity: 0"
    if (!condition) return;
    const elementsToShow = document.querySelectorAll(".elementToShow") as NodeListOf<HTMLElement>;
    if (elementsToShow) elementsToShow.forEach(element => element.style.opacity = "1");
};

export const reactComponentToHTML = (component: React.FunctionComponent) => {
    const JSXComponent = React.createElement(component);
    return ReactDOMServer.renderToString(JSXComponent);
};

export const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
    };
    
    const formatter = new Intl.DateTimeFormat("es-AR", options);
    const date = new Date();
    const formattedDate = formatter.format(date);

    return formattedDate;
};

export const insertDotsInPrice = (price: number) => {                                           //Función que inserta un punto cada 3 números en los precios
    const priceFormated = price.toString().includes(".") ? price.toFixed(2) : price.toString();
    const priceArr = priceFormated.split("");
    const includeDot = priceArr.indexOf(".") > 0;
    const iInitial = includeDot ? priceArr.length - 3 : priceArr.length;

    for (let i = iInitial - 3; i > 0; i -= 3) {
        priceArr.splice(i, 0, ".");
    }

    if (includeDot) {
        const lastDotIndex = priceArr.lastIndexOf(".");
        priceArr.splice(lastDotIndex, 1, ",");
    }
    
    return priceArr.join("");
};

export const getClientIP = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip as string;
    } catch (err) {
        return null;
    }
};

export const getClientDeviceInfo = () => {
    const userAgent = window.navigator.userAgent;

    // Determinar el sistema operativo
    let os = "Unknown OS";
    if (userAgent.indexOf("Win") !== -1) {
        os = "Windows";
    } else if (userAgent.indexOf("Mac") !== -1) {
        os = "MacOS";
    } else if (userAgent.indexOf("Linux") !== -1) {
        os = "Linux";
    } else if (userAgent.indexOf("Android") !== -1) {
        os = "Android";
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        os = "iOS";
    }

    // Determinar el navegador y su versión
    let browser = "Unknown Browser";
    let browserVersion = "Unknown Version";

    if (userAgent.indexOf("Chrome") !== -1) {
        browser = "Chrome";
        const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    } else if (userAgent.indexOf("Firefox") !== -1) {
        browser = "Firefox";
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    } else if (userAgent.indexOf("Safari") !== -1) {
        browser = "Safari";
        const match = userAgent.match(/Version\/(\d+\.\d+\.\d+)/);
        if (match) {
            browserVersion = match[1];
        }
    }

    return `OS: ${os}, Browser: ${browser} ${browserVersion}`;
};

export const getClientDevice = () => {
    const userAgent = window.navigator.userAgent;

    if (/mobile/i.test(userAgent)) {
        return "Celular";
    } else if (/tablet/i.test(userAgent)) {
        return "Tablet";
    } else if (/Win|Mac|Linux/i.test(userAgent)) {
        return "PC de escritorio o Notebook";
    } else {
        return "Desconocido";
    }
};

export const scrollWithoffset = (e: HTMLElement) => {                                            //Ajuste de offset con el link de contacto
    const navBar = document.querySelector(".contMenu") as HTMLDivElement;
    const altoNavBar = navBar.offsetHeight;
    const ypos = e.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top: ypos - altoNavBar, behavior: "smooth"});
};

export const getDateFromDateNow = (date: number): string => {                                    //Convierte un Date.now() / 1000 (por ej el timestamp que viene de la tabla "reviews" en el campo "time")
    const currentDate = new Date(date * 1000);                                                   // en una fecha   
    const argCurrentDate = currentDate.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    });
    return argCurrentDate.split(",")[0];
};

export const parseFilterQuerys = async (querys: QuerysData): Promise<QuerysDataParsed | null> => {
    const response1 = await getTable({tableName: "categoria"});
    if (!response1.success || !response1.data || !response1.data.length) return null;
    const categoriesData: Categoria[] = response1.data;

    const brandsFields: (keyof Marca)[] = ["id", "descripcion", "estado", "orden"];
    const response2 = await getTable({tableName: "marca", fields: brandsFields});
    if (!response2.success || !response2.data || !response2.data.length) return null;
    const brandsData: Marca[] = response2.data;

    brandsData.sort((a: any, b: any) => a.orden - b.orden);
    const brandsActived = brandsData.filter((brand) => brand.estado == "1");
    
    const categoriesIdsArr = querys.categories;
    const categoriesNamesArr = categoriesIdsArr.map((categorieID) => categoriesData.find((categorieData) => categorieData.id === parseInt(categorieID))?.nombre || "");

    const brandIDStr = querys.brandId;
    const brandIDNumber = parseInt(brandIDStr);
    const brandName = brandsData.find((brandData) => brandData.id === brandIDNumber)?.descripcion;

    const orderByRaw = querys.orderBy as FilterOrderByTypes;
    const orderByParsed = filterOrderByTypesEquivalences.find((equivalence) => equivalence.orderRaw === orderByRaw)?.orderParsed;
   
    return {
        "Palabras de búsqueda": querys.searchWords,
        Categorias: categoriesNamesArr,
        "Rango de precio": querys.priceRange,
        "Orden": orderByParsed || "",
        "Marca": brandName || brandsActived[0].descripcion,
        "Página": querys.pageNumberFromQuery,
    };
};