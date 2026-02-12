import { Cart, CartItem } from '../../../types/DASHBOARD/database';
import {
	InProcessOrderCardData,
	ProductForCart,
	UserForCart,
} from './inProcessOrders.types';

/**
 * Safely parse cart to CartItem array
 * Handles: array (direct), string (JSON), null/undefined
 */
export const parseCartItems = (cart: CartItem[] | string | null | undefined): CartItem[] => {
	if (!cart) return [];

	// If already an array, validate and return
	if (Array.isArray(cart)) {
		return cart.filter(
			(item) =>
				typeof item === 'object' &&
				item !== null &&
				typeof item.itemId === 'number' &&
				typeof item.quantity === 'number',
		);
	}

	// If string, try to parse as JSON
	if (typeof cart === 'string') {
		try {
			const parsed = JSON.parse(cart);
			if (!Array.isArray(parsed)) return [];
			return parsed.filter(
				(item) =>
					typeof item === 'object' &&
					item !== null &&
					typeof item.itemId === 'number' &&
					typeof item.quantity === 'number',
			);
		} catch {
			return [];
		}
	}

	return [];
};

/**
 * Calculate total quantity of items in cart
 */
export const calculateArticlesQty = (items: CartItem[]): number => {
	return items.reduce((acc, item) => acc + item.quantity, 0);
};

/**
 * Calculate total price of cart
 */
export const calculateCartTotal = (
	items: CartItem[],
	productsMap: Map<number, ProductForCart>,
): number => {
	return items.reduce((acc, item) => {
		const product = productsMap.get(item.itemId);
		return acc + (product?.precio || 0) * item.quantity;
	}, 0);
};

/**
 * Get the best available image for a product
 * Fallback order: foto1 -> foto2
 */
const getProductThumbnail = (product: ProductForCart): string | null => {
	const candidates = [product.foto1, product.foto2];
	for (const src of candidates) {
		if (src && typeof src === 'string' && src.trim()) {
			return src;
		}
	}
	return null;
};

/**
 * Get thumbnails for cart items (unique, max 6)
 */
export const getCartThumbnails = (
	items: CartItem[],
	productsMap: Map<number, ProductForCart>,
): string[] => {
	const thumbnails: string[] = [];
	const seen = new Set<string>();

	for (const item of items) {
		if (thumbnails.length >= 6) break;
		const product = productsMap.get(item.itemId);
		if (!product) continue;

		const thumb = getProductThumbnail(product);
		if (thumb && !seen.has(thumb)) {
			seen.add(thumb);
			thumbnails.push(thumb);
		}
	}

	return thumbnails;
};

/**
 * Calculate hours since last action
 */
export const calculateLastActionHours = (lastDate: number): number => {
	return Math.floor((Date.now() - lastDate) / (1000 * 60 * 60));
};

/**
 * Map raw cart data to view model
 */
export const mapCartToCardData = (
	cart: Cart,
	usersMap: Map<string, UserForCart>,
	productsMap: Map<number, ProductForCart>,
): InProcessOrderCardData | null => {
	const items = parseCartItems(cart.cart);
	if (items.length === 0) return null;

	const user = usersMap.get(cart.userEmail);
	if (!user) return null;

	return {
		cartId: cart.id,
		userId: user.id,
		userEmail: user.email,
		userName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.email,
		lastActionDate: cart.lastDate,
		articlesQty: calculateArticlesQty(items),
		total: calculateCartTotal(items, productsMap),
		lastActionHours: calculateLastActionHours(cart.lastDate),
		thumbnails: getCartThumbnails(items, productsMap),
	};
};

/**
 * Create a Map from users array keyed by email
 */
export const createUsersMap = (users: UserForCart[]): Map<string, UserForCart> => {
	const map = new Map<string, UserForCart>();
	for (const user of users) {
		if (user.email) {
			map.set(user.email, user);
		}
	}
	return map;
};

/**
 * Create a Map from products array keyed by id
 */
export const createProductsMap = (products: ProductForCart[]): Map<number, ProductForCart> => {
	const map = new Map<number, ProductForCart>();
	for (const product of products) {
		map.set(product.id, product);
	}
	return map;
};

/**
 * Filter cards by search term (user name or email)
 */
export const filterCardsBySearch = (
	cards: InProcessOrderCardData[],
	searchTerm: string,
): InProcessOrderCardData[] => {
	if (!searchTerm.trim()) return cards;

	const term = searchTerm.toLowerCase().trim();
	return cards.filter(
		(card) =>
			card.userName.toLowerCase().includes(term) ||
			card.userEmail.toLowerCase().includes(term),
	);
};
