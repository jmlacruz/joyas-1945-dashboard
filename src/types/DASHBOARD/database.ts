export type Database_CustomResponse = {
	success: boolean;
	message: string;
	data: any;
};

export type Function_CustomResponse = Database_CustomResponse;
export type Firebase_CustomResponse = Database_CustomResponse;

export type FilterOrderByTypes =
	| 'price_asc'
	| 'price_desc'
	| 'alphabetic'
	| 'default'
	| 'date'
	| 'random'; //Si se cambia algo de acá cambiar también el tipo en el back

export type Nota = {
	id?: number;
	titulo?: string;
	slug?: string;
	fecha?: string;
	intro?: string;
	descripcion?: string;
	foto?: string;
	thumbnail?: string;
};

export type Faqs = {
	id: number;
	question: string;
	order: number;
};

export type Faqs_answer = {
	id: number;
	id_faqs: number;
	value: string;
};

export type UsuarioListFieldsToTrim = {
	email: string;
	nombre: string;
	apellido: string;
	provincia: string;
	ciudad: string;
};

export const userFieldsFromDB: Array<keyof Usuario> = [
	'nombre',
	'apellido',
	'empresa',
	'rubro',
	'direccion',
	'cp',
	'ciudad',
	'provincia',
	'pais',
	'telefono',
	'email',
	'password',
	'permisos',
	'fecha_alta',
	'newsletter',
	'habilitado',
	'celular',
	'donde_conociste',
	'habilitado_pdj',
	'iva',
	'cuit',
	'razon',
	'envio_nombre',
	'envio_dni',
	'envio_localidad',
	'envio_provincia',
	'envio_cp',
	'envio_telefono',
	'envio_direccion',
	'vendedor',
	'id',
];

export const multiplicadorFieldsFromDB: Array<keyof Multiplicador> = ['valor', 'activo'];

export const grupoFieldsFromDB: Array<keyof Grupo> = ['nombre', 'valor'];

export const panoFieldsFromDB: Array<keyof Pano> = ['id', 'nombre'];

export const shippingMethodFieldsFromDB: Array<keyof Metodo_envio> = ['id', 'nombre'];

export type Rubro =
	| 'particular'
	| 'Revendedor'
	| 'comerciante'
	| 'Local minorista'
	| 'Local mayorista'
	| 'Distribuidor';

export type IVACodes = 'CF' | 'MO' | 'RI' | null;

export type Usuario = {
	id: number;
	login: string;
	password?: string;
	nombre: string;
	apellido: string;
	empresa: string;
	rubro: Rubro;
	direccion: string;
	cp: string;
	ciudad: string;
	provincia: string;
	pais: string;
	telefono: string;
	email: string;
	permisos: '0' | '10';
	codigo: string;
	fecha_alta: string; //La base recibe fechas en formato string "2024-12-31"
	newsletter: 0 | 1;
	habilitado: '0' | '1';
	token: string;
	celular: string;
	donde_conociste: string;
	primer_pedido: 0 | 1;
	habilitado_pdj: '0' | '1';
	reviews_send: number;
	iva: IVACodes;
	cuit: number | string;
	razon: string;
	subdominio: string;
	dominio: string;
	envio_nombre: string;
	envio_dni: string;
	envio_localidad: string;
	envio_provincia: string;
	envio_cp: string;
	envio_telefono: string;
	envio_direccion: string;
	envio_tipo: 'D' | 'S';
	login_adj2: string;
	fecha_login_adj2: string; //La base recibe fechas en formato string "2024-12-31"
	vendedor: number | string;
};

export type Vendedor = Usuario;

export type UsuarioParsed = Omit<Usuario, 'permisos'> & {
	permisos: 'Administrador' | 'Usuario';
};

export type Producto = {
	id: number;
	categoria: number | string; //"" para poder asignar un valor inicial nulo, ya que si ponemos 0 como valor inicial y no lo odificamos, la logica lo detecta como valor no nulo y no avisa que es un valor requerido
	codigo: string;
	nombre: string;
	descripcion: string;
	foto1: string;
	foto2: string;
	fecha_alta: string;
	precio: number;
	colecciones: '0' | '1';
	estado: '0' | '1';
	precioCalculado: number;
	marca: number | string; //"" para poder asignar un valor inicial nulo, ya que si ponemos 0 como valor inicial y no lo odificamos, la logica lo detecta como valor no nulo y no avisa que es un valor requerido
	order: number;
	id_grupo: number;
	notificado: '0' | '1';
	con_descuento: boolean;
	porcentaje_descuento: number;
	precio_full: number;
	thumbnail1: string; //Campos agregados por la API
	thumbnail2: string;
	foto1NameToDelete: string;
	foto2NameToDelete: string;
	precioDolar: number;
};

export type Marca = {
	id: number;
	orden: number | string; //string es para poder darle un valor nulo en nueva marca
	descripcion: string;
	fecha: string;
	imagen: string;
	pdf: string;
	pdf_recomendado: string;
	link: string;
	solapa: '0' | '1';
	estado: '0' | '1';
	logo: string;

	thumbnailImagen: string; //Campos que agrega la API para el front
	thumbnailLogo: string;
	imagenNameToDelete: string;
	logoNameToDelete: string;

	pdfName: string;
	pdfNameToDelete: string;
	pdfRecomendadoName: string;
	pdfRecomendadoNameToDelete: string;
};

// export type Destacado = {
// 	id: number;
// 	id_producto: number;
// 	titulo: string;
// 	subtitulo: string;
// 	descripcion: string;
// 	carrousel: '0' | '1';
// 	slug: string;
// 	meta_title: string;
// 	habilitada: '0' | '1';

// 	productoNombre: string; //Nombre del producto de destacado (agregado por el dash)
// 	productoId: number | string; //string por si hay que asignarle un string vacio "" si no se encuentra el producto en la base de datos (agregado por el dash)
// };

export type Categoria = {
	id: number;
	nombre: string;
	orden: number;
};

export type Grupo = {
	id: number;
	nombre: string;
	valor: number;
};

export type GrupoFormik = {
	//Tipo para el formik de nuevo grupo de precios
	nombre: string;
	valor: number | ''; //Al abrir la página tenemos que poner un valor inicial en valor = ""
};

export type Multiplicador = {
	id: number;
	valor: number;
	activo: 'Y' | 'N';
};

export type Novedad = {
	id: number;
	id_producto: number;
	titulo: string;
	subtitulo: string;
	descripcion: string;
	carrousel: '0' | '1';
	slug: string;
	meta_title: string;
	habilitada: '0' | '1';

	productoNombre: string; //Nombre del producto de la novedad (agregado por el dash)
	productoId: number | string; //string por si hay que asignarle un string vacio "" si no se encuentra el producto en la base de datos (agregado por el dash)
};

export type Config = {
	id: number;
	seccion: string;
	asunto: string;
	destinatarios: string;
	respuesta: string;
	activo: '0' | '1';
};

export type PricesGroupsListDataWithAditionalInfoForTable = Grupo & {
	productsQuantity: number;
	totalValue: number;
};

export type ImagesInfoOfBrand = {
	file: File | null;
	url: string;
	strB64: string;
	deleted: boolean;
};

export type BrandImagesInfo = {
	logo: ImagesInfoOfBrand;
	frontPage: ImagesInfoOfBrand;
};

export type ImagesInfoOfNewBrand = {
	file: File | null;
	strB64: string;
};

export type NewBrandImagesInfo = {
	logo: ImagesInfoOfNewBrand;
	frontPage: ImagesInfoOfNewBrand;
};

export type DocumentsInfoOfBrand = {
	file: File | null;
	url: string;
	deleted: boolean;
};

export type BrandDocumentsInfo = {
	pdf: DocumentsInfoOfBrand;
	recommended_pdf: DocumentsInfoOfBrand;
};

export type DocumentsInfoOfNewBrand = {
	file: File | null;
};

export type NewBrandDocumentsInfo = {
	pdf: DocumentsInfoOfNewBrand;
	recommended_pdf: DocumentsInfoOfNewBrand;
};

export type Pano = {
	id: number;
	nombre: string;
};

export type Panoxproducto = {
	id_producto: number;
	id_pano: number;
};

export type NewProductsOrderArr = { id: number; order: number }[];

export type Metodo_envio = {
	id: number;
	nombre: string;
};

export type PaymentMethods = 'P' | 'TDC' | 'MP' | 'B' | '';
export type PayState = 'P' | 'A';

export type Pedidos = {
	id: number;
	usuario: number;
	fecha: string;
	sesion_ip: string;
	total: number;
	estado: '0' | '1';
	observaciones: string;
	idPedido: string;
	id_metodo_envio: number;
	primer_pedido: 0 | 1; //Por defecto "primer_pedido" = 1, cuando se hace el primer pedido "primer_pedido" = 0 (se pasa a cero)
	pago_forma: PaymentMethods;
	pago_estado: PayState;
	costo_envio: number;
	vendedor: number;
	productsData: string;
	printedqty: number;
};

export type PedidosParsed = Pick<
	Pedidos,
	'id' | 'fecha' | 'estado' | 'pago_forma' | 'vendedor' | 'usuario' | 'printedqty'
> & {
	sellerName: string;
	userCompleteName: string;
	paymentMethod: string;
	skuProductos?: string[];
}; //Añadimos nombre del vendedor y nombre de usuario para la tabla

export type Detalle = {
	id_pedido: number;
	id_producto: number;
	precio: number;
	precioCalculado: number;
	cantidad: number;
	total: number;
	observaciones: string;
};

export type IncomeType = 'ok' | 'error' | '';

export type UsersLogsOrigins = 'Web' | 'Dashboard';

export type Log = {
	id: number;
	email: string;
	password: string;
	clave: string;
	id_usuario: number;
	ingreso: IncomeType;
	ip: string;
	date: string;
	time: number;
	device: string;
	device_info: string;
	origen: UsersLogsOrigins; //Web | Dashboard
};

export type Reviews = {
	id: number;
	author_name: string;
	author_url: string;
	profile_photo_url: string;
	language: string;
	rating: number;
	relative_time_description: string;
	text: string;
	time: number;
	added: number;
	control: string;
	show: '0' | '1';
};

export type ReviewFormDataFromDB = Pick<
	Reviews,
	| 'id'
	| 'author_name'
	| 'author_url'
	| 'profile_photo_url'
	| 'language'
	| 'rating'
	| 'text'
	| 'time'
	| 'show'
>;

export type Leads = {
	id: number;
	nombre: string;
	apellido: string;
	empresa: string;
	direccion: string;
	cp: string;
	ciudad: string;
	provincia: string;
	pais: string;
	telefono: string;
	email: string;
	celular: string;
	fecha_alta: number | ''; //El "" es para poder poner el input en blanco si no hay dato, en el form de editar lead
	fecha_actualizacion: number | ''; //El "" es para poder poner el input en blanco si no hay dato, en el form de editar lead
	referencia: string;
};

export type System_config = {
	id: number;
	config: string;
	value: string;
	label: string;
};

export type BrandsData = {
	brandName: string;
	brandID: number;
	articulos: number;
	monto: number;
};

export type Reporte = {
	nombre: string;
	apellido: string;
	userID: number;
	ingresos: number;
	ultimoIngreso: number;
	pedidos: number;
	articulos: number;
	monto: number;
	brandsData: BrandsData[];
};

export type NotificationType =
	| 'Nuevo contacto'
	| 'Nuevo usuario registrado'
	| 'Cuenta en proceso de activación'
	| 'Nuevo pedido (Detalle para admins)'
	| 'Nuevo pedido (Detalle para usuario)'
	| 'Producto deshabilitado'
	| 'Carrido abandonado'
	| 'Cuenta habilitada';

export type Log_envio = {
	id: number;
	notificationType: NotificationType;
	recipients: string;
	timestamp: number;
};

export type NotificationsLogsListFilter = {
	notificationType: NotificationType | '';
	recipients: string;
	from: string;
	to: string;
};

export type Habdeslog = {
	id: number;
	timestamp: number;
	id_producto: number;
	prevstate: '1' | '0';
	newstate: '1' | '0';
};

export type CartItem = {
	itemId: number;
	quantity: number;
};

export type Cart = {
	id: number;
	userEmail: string;
	cart: string;
	generalObservation: string;
	lastDate: number;
	cronJobId: number;
};
