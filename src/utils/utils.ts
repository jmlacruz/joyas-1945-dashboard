import { Channel, DefaultGenerics } from "stream-chat";
import { dateFieldsToParse, layoutData_initialValues, monthsList, productFormParsedFields } from "../data";
import { BuyerTypeOptions, LayoutData, PaymentOptions, StreamChatMessage, UsersActivity } from "../types/DASHBOARD";
import { IVACodes, PaymentMethods, Producto } from "../types/DASHBOARD/database";

export const waitAllImagesCharged = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const images = document.querySelectorAll("img");
        const allImagesCount = images.length;
        let imagesCount = 0;

        images.forEach((image) => {

            if (image.complete) {                                                   //image.complete = true si la imagen se cargó completamente o dio error
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
                return;
            }
            image.addEventListener("load", () => {                                  //Evento "load": La imagen pasó de cargando a cargada
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
            image.addEventListener("error", () => {                                 //Evento "error": La imagen paso de cargando a error (no se pudo cargar)
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
        });
    });
};

export const waitAllImagesChargedInElement = (element: HTMLDivElement): Promise<boolean> => {
    return new Promise((resolve) => {
        const images = element.querySelectorAll("img");
        const allImagesCount = images.length;
        let imagesCount = 0;
        images.forEach((image) => {

            if (image.complete) {                                                   //image.complete = true si la imagen se cargó completamente o dio error
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
                return;
            }
            image.addEventListener("load", () => {                                  //Evento "load": La imagen pasó de cargando a cargada
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
            image.addEventListener("error", () => {                                 //Evento "error": La imagen paso de cargando a error (no se pudo cargar)
                imagesCount++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
        });
    });
};

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

export function formatDateToSpanish(date: string) {
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

export function getCurrentDateFormatted() {													        //Obtiene la fecha actual en formato "dd/mm/yyyy" para que reciba el input si de la base de datos viene el campo de fecha nulo
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatDateString(dateString: string) {											        //Pasa de formato "yyyy-mm-dd" a "dd/mm/yyyy" que recibe el input
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

export function formatDateStringWithBars(dateString: string) {									         //Pasa de formato "yyyy-mm-dd" a "dd-mm-yyyy"
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

export function convertDateFormat(dateStr: string) {										            //Pasa de formaro "dd/mm/yyyy" a "yyyy-mm-dd" (que acepta mySQL)
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

function convertToDateFormat(isoString: string): string {                                               // Crea una fecha en formato "2024-12-31" a partir del string ISO 8601 que viene de la API (ejemplo: "2012-10-13T00:00:00.000Z")
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const parseDateFields = (dataArr: { [key: string]: any }[]) => {                                 //La fecha sale de la base de datos en formato Date pero al pasar por la API se pasa a string ISO 8601
    dataArr.forEach((data) => {                                                                         // (no es serializable)
        dateFieldsToParse.forEach((field) => {                                                          //Esta funcion pasa de formato string ISO 8601 a "2024-12-31"
            if (data && typeof data === "object" && Object.keys(data).includes(field)) {
                data[field] = convertToDateFormat(data[field] as string);
            }
        });
    });
};

export const dateStringToLocaleFormat = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
};

export const isFormChanged = (data1: object, data2: object) => {
    return JSON.stringify(data1) !== JSON.stringify(data2);
};

export const fileToBase64 = (file: File): Promise<string> => {                              //Convierte una variable tipo File (de un input tipo file por ejemplo) a un string base64
    // que puede ponerse directamente en el atributo "src" de una etiqueta "img"    
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    return new Promise((resolve, reject) => {

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const base64String = arrayBufferToBase64(arrayBuffer);
            resolve(`data:${file.type};base64,${base64String}`);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);

    });
};

export const base64ToFile = (base64String: string, fileName: string): File => {

    const [metadata, base64Content] = base64String.split(',');                          // Dividir el string en "data:[tipo_mime];base64," y el contenido en base64
    const mimeType = metadata.match(/:(.*?);/)?.[1] || '';                              // Extraer el tipo MIME (ej: "image/png" o "application/pdf")

    const extension = mimeType.split('/')[1];                                           // Obtener la extensión del archivo a partir del tipo MIME
    const fullFileName = `${fileName}.${extension}`;

    const binaryString = atob(base64Content);                                           // Convertir la cadena base64 a un ArrayBuffer
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    return new File([uint8Array], fullFileName, { type: mimeType });                    // Crear el archivo con el ArrayBuffer y el tipo MIME
};

export const showElement = (condition: boolean) => {                                    //Para usar esta función correctamente tenemos que tener una clase definida con nombre "elementToShow" y que tenga "opacity: 0"
    if (!condition) return;
    const elementToShow = document.querySelector(".elementToShow") as HTMLElement;
    if (elementToShow) elementToShow.style.opacity = "1";
};

export const getProductFormParseValues = (noParsedFields: Array<keyof Producto>) => {
    const parsedFieldsArr: string[] = [];
    noParsedFields.forEach((noParsedField) => {
        for (const key in productFormParsedFields) {
            if (key === noParsedField) {
                parsedFieldsArr.push(productFormParsedFields[key] as string);
            };
        }
    });
    return parsedFieldsArr;
};

export const getLayoutDataFromLocalStorage = (userEmail: string) => {
    const layoutData = localStorage.getItem(`layoutData-${userEmail}`);
    if (layoutData) {
        const layoutDataOBJ: LayoutData = JSON.parse(layoutData);
        return layoutDataOBJ;
    } else {
        return null;
    }
};

export const saveLayoutDataInLocalStorage = (options: { data: { [P in keyof LayoutData]?: LayoutData[P] }, userEmail: string }) => {
    const { data, userEmail } = options;
    const layoutData = localStorage.getItem(`layoutData-${userEmail}`);
    if (layoutData) {
        const layoutDataOBJ: LayoutData = JSON.parse(layoutData);
        const newLayoutData = { ...layoutDataOBJ, ...data };
        localStorage.setItem(`layoutData-${userEmail}`, JSON.stringify(newLayoutData));
    } else {
        const newLayoutData = { ...layoutData_initialValues, ...data };
        localStorage.setItem(`layoutData-${userEmail}`, JSON.stringify(newLayoutData));
    }
};

export const getIVAInfo = (ivaCode: IVACodes | undefined): BuyerTypeOptions => {
    switch (ivaCode) {
        case "CF":
            return "Consumidor Final";
        case "RI":
            return "Responsable Inscripto";
        case "MO":
            return "Monotributista";
        default:
            return "";
    }
};

export const getPaymentInfo = (paymentCode: PaymentMethods | undefined): PaymentOptions => {
    switch (paymentCode) {
        case "P":
            return "Lo resuelvo personalmente";
        case "TDC":
            return "Lo resuelvo personalmente";
        default:
            return "";
    }
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

export const getBreakPoint = () => window.innerWidth < 1536;

export const formatDateTime = (dateTimeString: string) => {                                //Transforma un objeto "datetime" de mysql aL FORMATO 31-12-24 22:55:59
    const date = new Date(dateTimeString);

    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
        hour12: false,
    };

    const formattedDateTime = date.toLocaleString("es-AR", options);
    return formattedDateTime.replace(",", "");
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

export const formatDateToString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
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
    const { userAgent } = window.navigator;

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
            [browserVersion] = match;
        }
    } else if (userAgent.indexOf("Firefox") !== -1) {
        browser = "Firefox";
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match) {
            [browserVersion] = match;
        }
    } else if (userAgent.indexOf("Safari") !== -1) {
        browser = "Safari";
        const match = userAgent.match(/Version\/(\d+\.\d+\.\d+)/);
        if (match) {
            [browserVersion] = match;
        }
    }

    return `OS: ${os}, Browser: ${browser} ${browserVersion}`;
};

export const getClientDevice = () => {
    const { userAgent } = window.navigator;

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

// Obtiene el nombre del archivo de una url de firebase el tipo "https://firebasestorage.googleapis.com/v0/b/joyas-fd367.appspot.com/o/images%2F11.11.2024-20.28.16-887.faqImage.jpeg?alt=media"
export const getFilenameFromFirebaseUrl = (firebaseUrl: string) => {
    const filename = firebaseUrl.split("%2F")[1].split("?")[0];
    return filename;
};

// Obtiene el nombre del archivo de una url de firebase el tipo "https://joyas1945.com/img/faqs/1544213733-1221177821.jpg"
export const getFilenameFromOriginalWebUrl = (webUrl: string) => {
    const lastSlashIndex = webUrl.lastIndexOf("/");
    const filename = webUrl.slice(lastSlashIndex + 1);
    return filename;
};

export const getMonthAndYearRange = (month: string, year: number): { from: number, to: number } => {                     //Recibe un año y un mes y devuelve el rango de timestamps (Date.now()) que corresponden a ese mes
    const months = monthsList;
    const mesIndex = months.indexOf(month);

    const from = new Date(year, mesIndex, 1).getTime();
    const to = new Date(year, mesIndex + 1, 0, 23, 59, 59, 999).getTime();

    return { from, to };
};

export const getYearRange = (year: number): { from: number, to: number } => {                                           //A partir de un año devuelve el timestamp (Date.now) del primer milisegundo del año y del ultimo
    const from = new Date(year, 0, 1).getTime(); // Inicio del año (1 de enero a las 00:00:00)
    const to = new Date(year, 11, 31, 23, 59, 59, 999).getTime(); // Fin del año (31 de diciembre a las 23:59:59)

    return { from, to };
};

export function getDayRange(dateString: string) {                                                                       //A partir de una fecha en formato "yyy-mm-dd" devuelve el timestamp (Date.now) del primer milisegundo del dia y del ultimo
    const [year, month, day] = dateString.split("-").map(Number);

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();                                            // Creamos la fecha para el inicio del día
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();                                         // Creamos la fecha para el final del día

    return { startOfDay, endOfDay };
}

export function getCurrentDate() {                                                                                      // Convierte un timestampo Date.now() en fecha en formato "yyyy-mm-dd"                                                                                     
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export const getOneMonthAgo = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export function convertToNoon(dateString: string): number {                                                            //A partir de una fecha en formato "yyy-mm-dd" devuelve el timestamp de ese dia al mediodia
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.getTime();
}

export function timestampToDateAndHour(timestamp: number): string {                                                     //Convierte un timestamp (Date.now()) a fecha y hora en formato "dd-mm-yyyy hh:mm:ss"
    const date = new Date(timestamp);

    const options: Intl.DateTimeFormatOptions = { timeZone: "America/Argentina/Buenos_Aires" };                         // Convertir el timestamp a la hora local de Argentina
    const localDate = new Date(
        date.toLocaleString("en-US", options)                                                                           // Convertimos la fecha al formato local de Argentina
    );

    const day = String(localDate.getDate()).padStart(2, "0");                                                           // Extraer componentes de la fecha
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();

    const hours = String(localDate.getHours()).padStart(2, "0");                                                        // Extraer componentes de la hora
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;                                                    // Formatear la fecha y la hora
}

export async function urlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();

        return await new Promise((resolve, reject) => {
            reader.onloadend = () => {
                if (reader.result) {
                    const result = (reader.result as string);
                    resolve(result);
                } else {
                    reject(new Error("Error converting image to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        return ("");
    }
}

export const filterStreamMessages = (messages: UsersActivity[]): UsersActivity[] => {                                   //Deja solo los mensajes con los emails con los ultimos timestamps    
    return Object.values(
        messages.reduce((acc, obj) => {
            const { userEmail, timestamp } = obj;
            if (!acc[userEmail] || acc[userEmail].timestamp < timestamp) {
                acc[userEmail] = obj;
            }
            return acc;
        }, {} as Record<string, UsersActivity>)
    );
};

export const getStreamMessages = async (channel: Channel<DefaultGenerics> | null, lastMinutes: number) => {             //Obtiene los mensajes de los ultimos "lastMinutes"
    try {
        if (!channel) return null;
        const twoMinutesAgo = new Date(Date.now() - lastMinutes * 60 * 1000).toISOString();                             
        const response = await channel.query({
            messages: { limit: 10, created_at_after: twoMinutesAgo },
        });

        if (response.messages) {
            const messages = response.messages.map(msg => {
                if (!msg.text) return null;
                try {
                    const dataOBJ: StreamChatMessage = JSON.parse(msg.text);
                    return {
                        ...dataOBJ.data,
                        activityType: dataOBJ.type,
                    };
                } catch (error) {
                    return null;
                }
            }).filter(Boolean); 														// Filtra los mensajes no válidos (null)
            return messages as UsersActivity[];
        }
        return null;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return null;
    }
};