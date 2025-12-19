import { getTable } from "../services/database";
import { Function_CustomResponse, Vendedor } from "../types/DASHBOARD/database";

export const sellerCodeExitst = async (sellerCode: string): Promise<Function_CustomResponse> => {
    const sellerFields: (keyof Vendedor)[] = ["codigo"];
    const response = await getTable({ tableName: "vendedor", fields: sellerFields });													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
    if (response.success && response.data && response.data.length) {
        const sellersData: Pick<Vendedor, "codigo">[] = response.data;
        const sellerCodes = sellersData.map((seller) => seller.codigo);
        return {success: true, data: sellerCodes.includes(sellerCode), message: ""};
    } 
    return {success: false, data: false, message: response.message};
};

export const verifyIfExistsUserByEmail = async (email: string) => {
    if (!email) return false;
    const response = await getTable({ tableName: "usuario", fields: ["id"], conditions: [{field: "email", value: email}] });
    return response.success && response.data && response.data.length;
};