export const formatDecimalPrice = (price: number, decimals = 2): string => {
    if (price === null || price === undefined || isNaN(price)) return "0";

    // Para decimal(12,4) necesitamos manejar hasta 4 decimales, pero mostrar según contexto
    const roundedPrice = Math.round(price * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return roundedPrice.toFixed(decimals);
};