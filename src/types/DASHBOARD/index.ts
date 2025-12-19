import { Database_CustomResponse, IncomeType, Producto } from './database';

export type Modal1State = {
	show: boolean;
	info?: {
		title: string;
		subtitle: string;
		icon: 'warning' | 'success' | 'error' | 'info';
		acceptButtonText?: string;
		cancelButtonText?: string;
		showCancelButton?: boolean;
	};
	isAccepted?: boolean;
	isCanceled?: boolean;
};

export type Modal1Icons = 'warning' | 'success' | 'error' | 'info';

export type Modal2ContextOptionType = {
	show: boolean;
	title?: string;
	subtitle?: string;
	firstButtonText?: string;
	secondButtonText?: string;
	icon?: Modal2IconList | '';
	firstButtonFunction?: () => void;
	secondButtonFunction?: () => void;
};

export type Modal2ContextType = {
	modal2State: {
		show: boolean;
		title: string;
		subtitle: string;
		firstButtonText: string;
		secondButtonText: string;
		icon: string;
		firstButtonFunction: () => void;
		secondButtonFunction: () => void;
	};
	setModal2: (options: Modal2ContextOptionType) => void;
};

export type LoginData = {
	email: string;
	password: string;
	rememberme: boolean;
};

export type SessionUserData = {
	email: string;
	name: string;
	lastName: string;
	registered: boolean;
	rememberme: boolean;
	isAdmin: boolean;
	streamChatToken: string;
	userId: string;
	city: string;
	token: '';
};

export type LogControllers_CustomResponse = Database_CustomResponse;

export type Modal2IconList = 'success' | 'warning' | 'error' | 'info';

export interface OrderProductsCardData {
	id: number;
	imageUrl: string;
	position: number;
	description: string;
	productCode: string;
	pageNumber: number;
}

export type LayoutData = {
	//Almacena datos del estado actual del dashboard (para guardar en el localstorage)
	sideBarExpanded: boolean;
	currentPath: string;
};

export type PaymentOptions = 'Lo resuelvo personalmente' | 'Transferencia o depósito bancario' | '';
export type BuyerTypeOptions = 'Monotributista' | 'Responsable Inscripto' | 'Consumidor Final' | '';
export type PayStateOptions = 'Pendiente' | 'Acreditado';

export type EditOrderNewProductExtraData = Pick<Producto, 'precio' | 'precioCalculado'>;
export type EditOrderProductDataModifiableFields = {
	cantidad: number;
	total: number;
	observaciones: string;
};
export type EditOrderNewProductListData = Pick<Producto, 'id' | 'nombre'>[];

export type ProductsListFilter = {
	categoria: string; //La categoría viene como string del select
	marca: string; //Buscamos por nombre de marca
	codigo: string;
	nombre: string;
	descripcion: string;
	fecha_alta: string;
	stock: {
		min: string;
		max: string;
	};
	estado: string;
	order: string;
	id_grupo: string;
	id_pano: string;
	new: boolean;
	inOrders: boolean;
};

export type UsersListFilter = {
	id: string;
	password: string;
	nombre: string;
	apellido: string;
	empresa: string;
	vendedor: string;
	rubro: string;
	direccion: string;
	cp: string;
	ciudad: string;
	provincia: string;
	pais: string;
	celular: string;
	telefono: string;
	donde_conociste: string;
	email: string;
	permisos: string;
	fecha_alta: string;
	habilitado: string;
	newsletter: string;
	habilitado_pdj: string;
};

export type ReportsListFilter = {
	year: string;
	month: string;
	from: string;
	to: string;
};

export type LogsListFilter = {
	email: string;
	ip: string;
	password: string;
	ingreso: IncomeType;
	from: string;
	to: string;
};

export type Month =
	| 'Enero'
	| 'Febrero'
	| 'Marzo'
	| 'Abril'
	| 'Mayo'
	| 'Junio'
	| 'Julio'
	| 'Agosto'
	| 'Septiembre'
	| 'Octubre'
	| 'Noviembre'
	| 'Diciembre';

export type StreamChatMessageType =
	| 'buy'
	| 'enter'
	| 'out'
	| 'purchase'
	| 'showProduct'
	| 'pagination'
	| 'filter';

export type StreamChatMessage = {
	type: StreamChatMessageType;
	data: ActivityDataDash;
};

export interface ActivityDataDash {
	name: string;
	lastName: string;
	userCity: string;
	itemDescription: string;
	itemImgSrc: string;
	userEmail: string;
	productID: number;
	timestamp: number;
	device: string;
	total: number;
	data?: any;
}

export interface UsersActivity extends ActivityDataDash {
	activityType: StreamChatMessageType;
}

export type QuerysDataParsed = {
	'Palabras de búsqueda': string[];
	Categorias: string[];
	'Rango de precio': number[];
	Orden: string;
	Marca: string;
	Página: number;
};
