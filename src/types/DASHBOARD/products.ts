import { Categoria, Grupo, Marca, Novedad } from './database';

export type ProductAditionalInfo = {
	categories: Categoria[];
	brands: Marca[];
	groups: Grupo[];
	news: Novedad[];
	isNews: boolean;
	newsID?: number;
	multiplier: number;
};

export type ImagesInfo = {
	file: File | null;
	urlImage: string;
	urlThumbnail: string;
	strB64: string;
	deleted: boolean;
};

export type ProductImagesInfo = {
	foto1: ImagesInfo;
	foto2: ImagesInfo;
};
