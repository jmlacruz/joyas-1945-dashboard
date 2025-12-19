import { FilterOrderByTypes } from "../types/database";

export const filterOrderByTypesEquivalences: {orderRaw: FilterOrderByTypes, orderParsed: string}[] = [
    {orderRaw: "alphabetic", orderParsed: "Alfabéticamente"},
    {orderRaw: "date", orderParsed: "Fecha de subida"},
    {orderRaw: "default", orderParsed: "Por defecto"},
    {orderRaw: "price_asc", orderParsed: "Precio ascendente"},
    {orderRaw: "price_desc", orderParsed: "Precio descendente"},
];

export const verifyTokenAPIError = "Verify Token ERROR";