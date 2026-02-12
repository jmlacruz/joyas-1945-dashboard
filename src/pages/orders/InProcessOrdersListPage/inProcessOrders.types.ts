import { CartItem } from '../../../types/DASHBOARD/database';

/**
 * Product data needed for cart display
 */
export type ProductForCart = {
	id: number;
	precio: number;
	nombre: string;
	foto1?: string;
	foto2?: string;
};

/**
 * User data needed for cart display
 */
export type UserForCart = {
	id: number;
	email: string;
	nombre: string;
	apellido: string;
};

/**
 * Parsed cart item with product details
 */
export type ParsedCartItem = CartItem & {
	productName: string;
	price: number;
	thumbnail: string;
};

/**
 * View model for a single in-process order card
 */
export type InProcessOrderCardData = {
	cartId: number;
	userId: number;
	userEmail: string;
	userName: string;
	lastActionDate: number;
	articlesQty: number;
	total: number;
	lastActionHours: number;
	thumbnails: string[];
};

/**
 * Pagination state
 */
export type PaginationState = {
	pageIndex: number;
	pageSize: number;
	totalCount: number;
};
