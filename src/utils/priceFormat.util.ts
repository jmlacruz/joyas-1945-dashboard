const priceFormat = (price: number): string => {
	if (!price && price !== 0) return '';
	return new Intl.NumberFormat('es-ES', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price);
};

export default priceFormat;
