import { LayoutData, PaymentOptions, PayStateOptions } from '../types/DASHBOARD';
import {
	Config,
	Faqs,
	Grupo,
	GrupoFormik,
	Marca,
	Metodo_envio,
	Multiplicador,
	NotificationType,
	Novedad,
	Pano,
	PaymentMethods,
	PayState,
	Pedidos,
	Producto,
	ReviewFormDataFromDB,
	Rubro,
	Usuario,
	Vendedor,
} from '../types/DASHBOARD/database';

export const dateFieldsToParse = [
	'fecha_alta',
	'fecha_login_adj2',
	'fecha',
]; /* Lista de campos que vienen de la base de datos como string pero se envian a la misma en formato Date */

export const usersFormRequiredFields: [keyof Usuario, string][] = [
	['email', 'Email'],
	['nombre', 'Nombre'],
	['apellido', 'Apellido'],
	['vendedor', 'Vendedor'],
	['provincia', 'Provincia'],
	['pais', 'Pais'],
	['telefono', 'Teléfono'],
	['fecha_alta', 'Fecha de alta'],
	['habilitado_pdj', 'Habilitado PDJ'],
];
export const priceMultiplierFormRequiredFields: [keyof Multiplicador, string][] = [
	['valor', 'Valor general'],
	['activo', 'Actualizar el precio de los grupos de precios'],
];
export const pricesGroupFormRequiredFields: [keyof Grupo, string][] = [
	['valor', 'Precio'],
	['nombre', 'Nombre'],
];
export const pricesGroupFormFormikRequiredFields: [keyof GrupoFormik, string][] = [
	['valor', 'Precio'],
	['nombre', 'Nombre'],
]; //Valores iniciales del formik de nuevo grupo de precios
export const clothFormRequiredFields: [keyof Pano, string][] = [['nombre', 'Nombre']];
export const shippingMethodFormRequiredFields: [keyof Metodo_envio, string][] = [
	['nombre', 'Nombre'],
];
export const orderFormRequiredFields: [keyof Pedidos, string][] = [
	['estado', 'Estado'],
	['id_metodo_envio', 'Método de envío'],
	['pago_forma', 'Forma de pago'],
	['pago_estado', 'Estado del pago'],
	['vendedor', 'Vendedor'],
];
export const sellerFormRequiredFields: [keyof Vendedor, string][] = [
	['nombre', 'Nombre'],
	['email', 'Email'],
];
export const faqFormRequiredFields: [keyof Faqs, string][] = [['question', 'Pregunta']];

export const productEditFormRequiredFields: Array<keyof Producto> = [
	'fecha_alta',
	'codigo',
	'nombre',
	'precio',
	'estado',
];
export const productEditFormNotNegativeFields: Array<keyof Producto> = ['precio', 'order'];

export const productNewFormRequiredFields: Array<keyof Producto> =
	productEditFormRequiredFields.concat(['categoria', 'marca']);
export const productNewFormNotNegativeFields: Array<keyof Producto> = ['precio'];
export const productNewFormNotZeroFields: Array<keyof Producto> = ['categoria', 'marca'];

export const messagingSettingsRequiredFields: [keyof Config, string][] = [
	['asunto', 'Asunto'],
	['destinatarios', 'Destinatarios'],
	['respuesta', 'Respuesta Automática'],
];
export const brandRequiredFields: [keyof Marca, string][] = [
	['orden', 'Orden'],
	['descripcion', 'Descripcion'],
	['estado', 'Estado'],
];

export const newsEditFormRequiredFields: [keyof Novedad, string][] = [
	['titulo', 'Título'],
	['descripcion', 'Descripción'],
	['carrousel', 'Mostrar en carrousel'],
	['slug', 'URL Amigable'],
];
export const reviewsEditFormRequiredFields: [keyof ReviewFormDataFromDB, string][] = [
	['rating', 'Rating'],
	['show', 'Mostrar en sitio'],
];

export const productFormParsedFields: { [key in keyof Partial<Producto>]: string } = {
	fecha_alta: 'Fecha de alta',
	codigo: 'Código',
	nombre: 'Nombre',
	precio: 'Precio',
	estado: 'Estado',
	categoria: 'Categoría',
	marca: 'Marca',
	id_grupo: 'Grupo',
	order: 'Orden',
};

export const rubrosList: { value: Rubro; text: string }[] = [
	{ value: 'particular', text: 'Particular' },
	{ value: 'Revendedor', text: 'Revendedor' },
	{ value: 'comerciante', text: 'Comerciante' },
	{ value: 'Local minorista', text: 'Local minorista' },
	{ value: 'Local mayorista', text: 'Local mayorista' },
	{ value: 'Distribuidor', text: 'Distribuidor' },
];

export const layoutData_initialValues: LayoutData = {
	sideBarExpanded: true,
	currentPath: '',
};

export const paymentMethodsSelectData: { code: PaymentMethods; text: PaymentOptions }[] = [
	{ code: 'P', text: 'Lo resuelvo personalmente' },
	{ code: 'TDC', text: 'Transferencia o depósito bancario' },
];

export const payStateSelectData: { code: PayState; text: PayStateOptions }[] = [
	{ code: 'P', text: 'Pendiente' },
	{ code: 'A', text: 'Acreditado' },
];

export const tablesForNotParseDateFields = ['leads'];

export const monthsList = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
];

export const notificationsTypesList: NotificationType[] = [
	'Nuevo contacto',
	'Nuevo usuario registrado',
	'Cuenta en proceso de activación',
	'Nuevo pedido (Detalle para admins)',
	'Nuevo pedido (Detalle para usuario)',
	'Producto deshabilitado',
	'Carrido abandonado',
	'Cuenta habilitada',
];
