import { Database_CustomResponse } from "./database";

export type CartItem = {
    itemId: number,
    quantity: number
    observation?: string
}

export type CartData = {
    cartItems: CartItem[]
    generalObservation?: string
};

export interface CartDataFromDB {
    userEmail: string,
    cart: string,                           //Es un JSON
    generalObservation: string
    lastDate: number;
    cronJobId: number | null;
} 

export interface CartDataForDBFromFront {
    userEmail: string,
    cartData: CartData,
}

export type LoginData = {
    email: string,
    password: string,
    rememberme: boolean,
}

export type SessionUserData = {
    email: string,
    name: string,
    lastName: string,
    registered: boolean,
    rememberme: boolean
    isAdmin: boolean,
    streamChatToken: string,
    userId: string,
    city: string,
    dolar: boolean,
    token: string,
}

export type StreamChatMessageType = "buy" | "enter" | "out" | "purchase" | "showProduct" | "pagination" | "filter";

export type StreamChatMessage = {
    type: StreamChatMessageType,
    data: ActivityData,
}

export type ActivityData = {
    name: string,
    lastName: string,
    userCity: string, 
    itemDescription: string, 
    itemImgSrc: string, 
    userEmail: string,
    productID: number,
    timestamp: number,
    device: string,
    total: number,
    data?: any,
}

export type LogControllers_CustomResponse = Database_CustomResponse;

export type OrderForMailData = {
    currentDate: string,
    total: number,
    shippingMethod: string,
    paymentMethod: PaymentOptions,
    generalObservations: string,
    productsDataArr: {
        description: string,
        imgSrc: string,
        itemObservations: string,
        unitPrice: number,
        quantity: number,
        total: number,
        code: string,
    }[],
}

export type FiltersStatus = {filtersOpen: boolean }

export type QuerysData = {                                                                                       
    searchWords: string[],
    categories: string[],
    priceRange: number[],
    orderBy: string,
    brandId: string,
    pageNumberFromQuery: number,
};

export type QuerysDataParsed = {                                                                                       
    "Palabras de búsqueda": string[],
    Categorias: string[],
    "Rango de precio": number[],
    "Orden": string,
    "Marca": string,
    "Página": number,
};

export type ShippingMethodForLocalStorage =  {
    shippingMethodNumber: number, 
    shippingMethodName: string,
}

export type PaymentMethodForLocalStorage =  {
    paymentMethodNumber: number,
    paymentMethodName: string,
}

export type BuyerTypeForLocalStorage =  {
    buyerTypeNumber: number,
    buyerTypeName: string,
}

export type PaymentOptions = "Lo resuelvo personalmente" | "Transferencia o depósito bancario" | "";
export type BuyerTypeOptions = "Monotributista" | "Responsable Inscripto" | "Consumidor Final" | "";

export type BuyerData =  {
    "": "",
    "CUIT": string,
    "DNI": string,
    "Razón Social": string,
    "Nombre Completo": string,
}

export type OrderData = {
    shippingMethodID: number | null
    paymentMethod: PaymentOptions,
    buyerType: BuyerTypeOptions,
    buyerData: BuyerData,
    clientIP: string | null,
}   

export type ContactFormValues = {
    name: string,
    last_name: string,
    email: string,
    message: string,
}

export type ReviewDataForLanding = {
    name: string,
    review: string,
}

export type LastSessionTimestamp = {
    timestamp: number,
}

export type UsersLogsOrigins = "Web" | "Dashboard";