import {
	ColumnDef,
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WaitImages from '../../../../components/DASHBOARD/waitImages/WaitImages';
import Checkbox from '../../../../components/form/Checkbox';
import FieldWrap from '../../../../components/form/FieldWrap';
import Input from '../../../../components/form/Input';
import Label from '../../../../components/form/Label';
import Select from '../../../../components/form/Select';
import Icon from '../../../../components/icon/Icon';
import Container from '../../../../components/layouts/Container/Container';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '../../../../components/layouts/Subheader/Subheader';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Tooltip from '../../../../components/ui/Tooltip';
import { appPages } from '../../../../config/pages.config';
import { Modal2Context } from '../../../../context/modal2Context';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { showModal1 } from '../../../../features/modalSlice';
import {
	deleteRowByID,
	deleteRows,
	getProductsFiltered,
	getTable,
	updateTable,
} from '../../../../services/database';
import { deleteFiles } from '../../../../services/firebase';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';
import { ProductsListFilter } from '../../../../types/DASHBOARD';
import {
	Categoria,
	Detalle,
	Grupo,
	Marca,
	Novedad,
	Pano,
	Panoxproducto,
	Producto,
} from '../../../../types/DASHBOARD/database';
import priceFormat from '../../../../utils/priceFormat.util';
import { dateStringToLocaleFormat, isValidJSON, showElement } from '../../../../utils/utils';
import './productJoyasList.page.css';

const columnHelper = createColumnHelper<Producto>();
const editLinkPath = `../${appPages.salesAppPages.subPages.productPage.subPages.editPageLink.to}/`;
const paginationInitialState: PaginationState = { pageIndex: 0, pageSize: 20 };
const useQuery = () => new URLSearchParams(useLocation().search);

const getProductsIDsArrByCloth = async (panoID: number) => {
	const response0 = await getTable({
		tableName: 'panoxproducto',
		fields: ['id_producto'],
		conditions: [{ field: 'id_pano', value: panoID }],
	});
	if (response0.success && response0.data && response0.data.length) {
		const clothData: Panoxproducto[] = response0.data;
		return clothData.map((cloth) => cloth.id_producto);
	}
	return [];
};

let productsIDsInNews: number[] = [];
(async () => {
	const newFields: Array<keyof Novedad> = ['id_producto'];
	const responseNew = await getTable({ tableName: 'novedad', fields: newFields });
	const newData: Novedad[] = responseNew.data || [];
	productsIDsInNews = newData.map((news) => news.id_producto);
})();

let productsIDsInOrderDetail: number[] = [];
(async () => {
	const orderDetailFields: Array<keyof Detalle> = ['id_producto'];
	const responseOrderDetail = await getTable({ tableName: 'detalle', fields: orderDetailFields });
	const orderDetailData: Detalle[] = responseOrderDetail.data || [];
	productsIDsInOrderDetail = orderDetailData.map((detail) => detail.id_producto);
})();

const sortProductsByOrder = (products: Producto[]) =>
	[...products].sort(
		(productA, productB) => Number(productA.order ?? 0) - Number(productB.order ?? 0),
	);

const applyFilter = async (data: {
	filter: ProductsListFilter;
	productsInitialData: Producto[];
	setData: React.Dispatch<React.SetStateAction<Producto[] | null>>;
}) => {
	const { filter, productsInitialData, setData } = data;
	let dataFiltered: Producto[] = structuredClone(productsInitialData);
	if (filter.categoria)
		dataFiltered = dataFiltered.filter(
			(product) => product.categoria === parseInt(filter.categoria),
		); //.normalize("NFD").replace(/[\u0300-\u036f]/g, "") saca tildes
	if (filter.marca)
		dataFiltered = dataFiltered.filter((product) => product.marca === filter.marca); //replace(/\s+/g, " ") reemplaza espacios en blanco multiples por un solo espacio en blanco (ya que si el nombre en la base de datos tiene algun espacio multiple entre palabras y nuestra frase de busqueda tiene solo espacios simples no habrá resultados de busqueda)
	if (filter.codigo)
		dataFiltered = dataFiltered.filter((product) =>
			product.codigo?.includes(filter.codigo.trim()),
		);
	if (filter.nombre)
		dataFiltered = dataFiltered.filter((product) =>
			product.nombre
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.nombre
						.toLowerCase()
						.trim()
						.replace(/\s+/g, ' ')
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.descripcion)
		dataFiltered = dataFiltered.filter((product) =>
			product.descripcion
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.descripcion
						.toLowerCase()
						.trim()
						.replace(/\s+/g, ' ')
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.fecha_alta) {
		const datefromInput = filter.fecha_alta; //Viene en formato yyyy-mm-dd
		const [y, m, d] = datefromInput.split('-');
		const dateFromInputParsed = `${d}-${m}-${y}`;
		dataFiltered = dataFiltered.filter(
			(product) => dateStringToLocaleFormat(product.fecha_alta) === dateFromInputParsed,
		);
	}
	if (filter.estado)
		dataFiltered = dataFiltered.filter((product) => product.estado === filter.estado);
	if (filter.order)
		dataFiltered = dataFiltered.filter((product) => product.order === parseInt(filter.order));
	if (filter.id_grupo)
		dataFiltered = dataFiltered.filter(
			(product) => product.id_grupo === parseInt(filter.id_grupo),
		);
	if (filter.id_pano) {
		const productsIDsInCloth = await getProductsIDsArrByCloth(parseInt(filter.id_pano));
		dataFiltered = dataFiltered.filter((product) => productsIDsInCloth.includes(product.id));
	}
	if (filter.new)
		dataFiltered = dataFiltered.filter((product) => productsIDsInNews.includes(product.id));
	if (filter.inOrders)
		dataFiltered = dataFiltered.filter((product) =>
			productsIDsInOrderDetail.includes(product.id),
		);
	setData(sortProductsByOrder(dataFiltered));
};

const filterClearValues = {
	categoria: '',
	marca: '',
	codigo: '',
	nombre: '',
	descripcion: '',
	fecha_alta: '',
	stock: {
		min: '',
		max: '',
	},
	estado: '',
	order: '',
	id_grupo: '',
	id_pano: '',
	new: false,
	inOrders: false,
};

const ProductJoyasListPage = () => {
	const query = useQuery();

	const panoID = query.get('panoID');
	const panoIDParsed = panoID && !Number.isNaN(parseInt(panoID)) ? parseInt(panoID) : null;
	const pricesGroup = query.get('pricesGroupID');
	const pricesGroupIDParsed =
		pricesGroup && !Number.isNaN(parseInt(pricesGroup)) ? parseInt(pricesGroup) : null;

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Producto[] | null>(null);
	const initialData = useRef<Producto[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);
	const dispatch = useDispatch();
	const { setModal2 } = useContext(Modal2Context);
	const thisLocation = useLocation();
	const firstRender = useRef(true);
	const firstRenderForSaveFilter = useRef(true);
	const navigate = useNavigate();
	const clothByProductFromDB = useRef<Panoxproducto[] | null>(null);
	const clothsFromDB = useRef<Pano[] | null>(null);

	const [filter, setFilter] = useState<ProductsListFilter>(filterClearValues);
	const [filterData, setFilterData] = useState<{
		categoriesList: Categoria[];
		brandsList: Marca[];
		groupList: Grupo[];
		clothList: Pano[];
		newsList: Novedad[];
	}>({
		categoriesList: [],
		brandsList: [],
		groupList: [],
		clothList: [],
		newsList: [],
	});
	const [showFilters, setShowFilters] = useState(false);

	const handleShowFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			filtersCont.style.transitionDuration = '0.5s';
			if (filtersCont.style.maxHeight === '' || filtersCont.style.maxHeight === '0px') {
				setShowFilters(true);
				filtersCont.style.maxHeight = filtersCont.scrollHeight + 'px';
				localStorage.setItem('productsListShowFilters', JSON.stringify(true));
			} else {
				setShowFilters(false);
				filtersCont.style.maxHeight = '0px';
				localStorage.setItem('productsListShowFilters', JSON.stringify(false));
			}
		}
	};

	const openFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(true);
			filtersCont.style.transitionDuration = '0s';
			filtersCont.style.maxHeight = filtersCont.scrollHeight + 'px';
		}
	};

	const closeFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(false);
			filtersCont.style.transitionDuration = '0s';
			filtersCont.style.maxHeight = '0px';
		}
	};

	const resetFilter = () => {
		setFilter(filterClearValues);
		applyFilter({
			filter: filterClearValues,
			productsInitialData: initialData.current || [],
			setData,
		});
		navigate(thisLocation.pathname); //Borra querys de la url
	};

	const getClothNameByProductID = (productID: number) => {
		if (!clothByProductFromDB.current || !clothsFromDB.current) return '';
		const clothID = clothByProductFromDB.current.find(
			(clothByProduct) => clothByProduct.id_producto === productID,
		)?.id_pano;
		if (!clothID) return '';
		const clothName = clothsFromDB.current?.find((cloth: Pano) => cloth.id === clothID)?.nombre;
		if (!clothName) return '';
		return clothName;
	};

	useEffect(() => {
		if (firstRender.current) {
			//Activamos el spinner solo al entrar en la pagina
			firstRender.current = false;
			showSpinner(true);
		}

		(async () => {
			const clothByProductFields: Array<keyof Panoxproducto> = ['id_producto', 'id_pano'];
			const responseClothByProduct = await getTable({
				tableName: 'panoxproducto',
				fields: clothByProductFields,
			});
			const clothByProductData: Panoxproducto[] = responseClothByProduct.data || [];
			clothByProductFromDB.current = clothByProductData; //Dato necesario para obtener nombe de paño en la tabla

			const clothFields: Array<keyof Pano> = ['id', 'nombre'];
			const responseCloth = await getTable({ tableName: 'pano', fields: clothFields });
			const clothData: Pano[] = responseCloth.data || [];
			setFilterData((current) => ({ ...current, clothList: clothData }));
			clothsFromDB.current = clothData; //Dato necesario para obtener nombe de paño en la tabla

			const groupFields: Array<keyof Grupo> = ['id', 'nombre'];
			const responseGroups = await getTable({ tableName: 'grupo', fields: groupFields });
			const groupsData: Grupo[] = responseGroups.data || [];
			setFilterData((current) => ({ ...current, groupList: groupsData }));

			const categoriesFields: Array<keyof Categoria> = ['id', 'nombre'];
			const categoriesResoponse = await getTable({
				tableName: 'categoria',
				fields: categoriesFields,
			});
			if (
				categoriesResoponse.success &&
				categoriesResoponse.data &&
				categoriesResoponse.data.length
			) {
				const categories: Categoria[] = categoriesResoponse.data;
				setFilterData((current) => ({ ...current, categoriesList: categories }));
			}

			const responseBrands = await getTable({
				tableName: 'marca',
				fields: ['id', 'descripcion'],
			});
			const brandsData: Marca[] = responseBrands.data || [];
			setFilterData((current) => ({ ...current, brandsList: brandsData }));

			const fieldsProductsList: Array<keyof Partial<Producto>> = [
				'id',
				'foto1',
				'foto2',
				'order',
				'categoria',
				'marca',
				'codigo',
				'nombre',
				'fecha_alta',
				'precio',
				'estado',
				'descripcion',
				'id_grupo',
			];
			const response1 = await getProductsFiltered({
				fields: fieldsProductsList,
				limit: Infinity,
				offset: 0,
				orderBy: 'date',
				searchWordsArr: [],
				priceRangeArr: [],
				categoriesIdsArr: [],
				brand: '',
			});

			const productsData: Producto[] = response1.data;
			const categoriesData: Categoria[] = categoriesResoponse.data || [];
			if (response1.success && response1.data && response1.data.length) {
				const productsDataWithBrandAndCategory = productsData.map((product) => {
					const currentBrand = brandsData.find(
						(brand: Marca) => brand.id === product.marca,
					);
					const currentCategory = categoriesData.find(
						(category: Categoria) => category.id === product.categoria,
					);
					return {
						...product,
						marca: currentBrand?.descripcion || product.marca,
						categoria: currentCategory?.nombre || product.categoria,
					};
				});
				const orderedProductsData = sortProductsByOrder(productsDataWithBrandAndCategory);
				initialData.current = orderedProductsData;

				const usersListShowFiltersJSON = localStorage.getItem('productsListShowFilters');
				const usersListShowFiltersOBJ =
					usersListShowFiltersJSON && isValidJSON(usersListShowFiltersJSON)
						? JSON.parse(usersListShowFiltersJSON)
						: null;
				usersListShowFiltersOBJ ? openFilters() : closeFilters();

				const savedFilterJSON = localStorage.getItem('productsListFilter');
				const savedFilterOBJ: ProductsListFilter =
					savedFilterJSON && isValidJSON(savedFilterJSON)
						? JSON.parse(savedFilterJSON)
						: null;

				const filterWithQueryValues = structuredClone(filter);
				if (panoIDParsed) filterWithQueryValues.id_pano = panoIDParsed.toString();
				if (pricesGroupIDParsed)
					filterWithQueryValues.id_grupo = pricesGroupIDParsed.toString();

				if (panoIDParsed || pricesGroupIDParsed) {
					applyFilter({
						filter: filterWithQueryValues,
						productsInitialData: initialData.current || [],
						setData,
					});
				} else if (savedFilterOBJ) {
					setFilter(savedFilterOBJ);
					applyFilter({
						filter: savedFilterOBJ,
						productsInitialData: initialData.current || [],
						setData,
					});
				} else {
					applyFilter({
						filter,
						productsInitialData: initialData.current || [],
						setData,
					});
				}
			} else if (response1.success && response1.data && !response1.data.length) {
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'No se encontraron productos',
							subtitle: response1.message,
							icon: 'info',
						},
					}),
				);
				setData([]);
				showSpinner(false);
			} else {
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'Error al renderizar la tabla',
							subtitle: response1.message,
							icon: 'error',
						},
					}),
				);
				showSpinner(false);
			}
		})();
		//eslint-disable-next-line
	}, [thisLocation]); //thisLocation es por si estamos listando productos por paño y elegimos "Listado de productos" en el menu para que se actualice la lista

	const enableProduct = async (e: React.ChangeEvent<HTMLInputElement>, productID: number) => {
		//Función que se le pasa al check de habilitar producto en la tabla de productos (para habilitar o deshabilitar un producto)
		const target = e.target as HTMLInputElement;
		const { checked: enabled } = target;

		const response = await updateTable({
			tableName: 'producto',
			conditions: [{ field: 'id', value: productID }],
			data: { estado: enabled ? '1' : '0' },
		});
		if (!response.success) {
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Error al cambiar estado',
						subtitle: `No se pudo ${enabled ? ' habilitar' : ' deshabilitar'} el producto: ${response.message}`,
						icon: 'error',
					},
				}),
			);
		}

		setData((current) => {
			if (current) {
				const dataAux = structuredClone(current); //Modificamos el estado el producto en "data", luego hacemos un set para actualizar la tabla sin hacer reload de la misma
				const productToChangeStateIndex = dataAux.findIndex(
					(product) => product.id === productID,
				);
				if (productToChangeStateIndex !== -1) {
					dataAux[productToChangeStateIndex].estado = enabled ? '1' : '0';
				}
				initialData.current = dataAux;
				return dataAux;
			} else {
				return [];
			}
		});

		dispatch(
			showModal1({
				show: true,
				info: {
					title: 'Error al cambiar estado automático',
					subtitle: `No se pudo ${enabled ? ' habilitar' : ' deshabilitar'} el estado automático el producto: ${response.message}`,
					icon: 'error',
				},
			}),
		);
	};

	const deleteProductFunc = async (options: {
		productID: number;
		productName: string;
		imagesNamesToDeleteArr: string[];
	}) => {
		showSpinner(true);

		const { productID, productName, imagesNamesToDeleteArr } = options;

		if (imagesNamesToDeleteArr.length) {
			const promises = imagesNamesToDeleteArr.map(async (name) => {
				const response = await deleteFiles(name);
				if (!response.success) {
					throw new Error(response.message);
				}
				return response;
			});
			try {
				await Promise.all(promises);
			} catch (err) {
				err instanceof Error
					? dispatch(
							showModal1({
								show: true,
								info: {
									title: 'No se pudieron eliminar las imágenes del bucket',
									subtitle: err.message,
									icon: 'error',
								},
							}),
						)
					: dispatch(
							showModal1({
								show: true,
								info: {
									title: 'No se pudieron eliminar las imágenes del bucket',
									subtitle: 'Error desconocido',
									icon: 'error',
								},
							}),
						);
				showSpinner(false);
				return;
			}
		}

		const response = await deleteRowByID({ tableName: 'producto', rowID: productID });
		if (response.success && response.data >= 1) {
			//La base de datos devuelve el número de filas eliminadas

			setData((current) => {
				if (current) {
					const productsFiltered = current.filter((product) => product.id !== productID);
					initialData.current = productsFiltered;
					return productsFiltered;
				} else {
					return [];
				}
			});
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Acción completada',
						subtitle: `Se eliminó el producto: ${productName}`,
						icon: 'success',
					},
				}),
			);
		} else if (response.success && response.data === 0) {
			//Si no se eliminó ninguna fila la base devuelve 0
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'No se pudo eliminar el producto.',
						subtitle: 'Producto no encontrado en la base de datos',
						icon: 'error',
					},
				}),
			);
			showSpinner(false);
			return;
		} else {
			dispatch(
				showModal1({
					show: true,
					info: { title: 'Error', subtitle: response.message, icon: 'error' },
				}),
			);
			showSpinner(false);
			return;
		}

		const response2 = await deleteRows({
			tableName: 'novedad',
			conditions: [{ field: 'id_producto', value: productID }],
		});
		if (!response2.success) {
			showSpinner(false);
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Error al eliminar producto de novedades',
						subtitle: response2.message,
						icon: 'error',
					},
				}),
			);
		}

		const response3 = await deleteRows({
			tableName: 'panoxproducto',
			conditions: [{ field: 'id_producto', value: productID }],
		});
		if (!response3.success) {
			showSpinner(false);
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Error al eliminar producto de paños',
						subtitle: response3.message,
						icon: 'error',
					},
				}),
			);
		}
	};

	const warningForDeleteProductFunction = (
		productID: number,
		productName: string,
		imagesNamesToDeleteArr: string[],
	) =>
		setModal2({
			show: true,
			title: 'Eliminación de producto',
			icon: 'warning',
			subtitle: `Se eliminará el producto: ${productName}. Desea continuar?`,
			firstButtonText: 'Cancelar',
			secondButtonText: 'Confirmar',
			firstButtonFunction: () => setModal2({ show: false }),
			secondButtonFunction: () => {
				setModal2({ show: false });
				deleteProductFunc({ productID, productName, imagesNamesToDeleteArr });
			},
		});

	const columns = useMemo<ColumnDef<Producto, any>[]>(
		() => [
			columnHelper.accessor('thumbnail1', {
				cell: (info) => (
					<Link
						to={`${editLinkPath}${info.row.original.id}`}
						className='d-flex relative block aspect-[1/1] w-16 rounded'>
						<WaitImages>
							<img src={info.getValue()} alt={info.row.original.nombre} />
						</WaitImages>
					</Link>
				),
				header: 'Foto',
				footer: 'Foto',
				enableGlobalFilter: false,
				enableSorting: false,
				id: 'thumbnail1',
			}),
			columnHelper.accessor('order', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Orden',
				footer: 'Orden',
				id: 'order',
			}),
			columnHelper.accessor('categoria', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Categoría',
				footer: 'Categoría',
				id: 'categoria',
			}),
			columnHelper.accessor('marca', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Marca',
				footer: 'Marca',
				id: 'marca',
			}),

			columnHelper.accessor('codigo', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Código',
				footer: 'Código',
				id: 'codigo',
			}),
			columnHelper.accessor('nombre', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Nombre',
				footer: 'Nombre',
				id: 'nombre',
			}),
			columnHelper.accessor('fecha_alta', {
				cell: (info) => <span>{dateStringToLocaleFormat(info.getValue() as string)}</span>,
				header: 'Fecha de alta',
				footer: 'Fecha de alta',
				id: 'fecha',
			}),

			columnHelper.accessor('precio', {
				cell: (info) => <span>${priceFormat(Number(info.getValue()))}</span>,
				header: 'Precio',
				footer: 'Precio',
				id: 'precio',
			}),

			columnHelper.accessor('estado', {
				cell: (info) => (
					<div className='dflex wh100'>
						<Tooltip text={info.getValue() === '1' ? 'Deshabilitar' : 'Habilitar'}>
							<Checkbox
								variant='switch'
								onChange={(e) => enableProduct(e, info.row.original.id)}
								checked={info.getValue() === '1'}
							/>
						</Tooltip>
					</div>
				),
				header: 'Habilitado',
				footer: 'Habilitado',
				id: 'estado',
			}),
			columnHelper.accessor('id', {
				cell: (info) => (
					<Link className='dflex wh100' to={`/sales/product/${info.getValue()}`}>
						<Tooltip text='Editar Producto'>
							<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
						</Tooltip>
					</Link>
				),
				header: 'Editar',
				footer: 'Editar',
				enableSorting: false,
				id: 'id',
			}),
			columnHelper.accessor('id', {
				cell: (info) => {
					const imagesNameArr: string[] = [];
					if (info.row.original.foto1NameToDelete)
						imagesNameArr.push(info.row.original.foto1NameToDelete);
					if (info.row.original.foto2NameToDelete)
						imagesNameArr.push(info.row.original.foto2NameToDelete);
					return (
						<div
							className='dflex wh100'
							onClick={() =>
								warningForDeleteProductFunction(
									info.getValue() as number,
									info.row.original.nombre,
									imagesNameArr,
								)
							}>
							<Tooltip text='Eliminar Producto'>
								<Icon
									icon='HeroTrash'
									color='red'
									size='text-3xl'
									className='trashIconRed'
								/>
							</Tooltip>
						</div>
					);
				},
				header: 'Eliminar',
				footer: 'Eliminar',
				enableSorting: false,
				id: 'id2',
			}),
		],
		//eslint-disable-next-line
		[columnHelper],
	);

	const table = useReactTable({
		data: data || [],
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		enableGlobalFilter: true,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: paginationInitialState,
		},
		// debugTable: true,
	});

	useEffect(() => {
		if (!data) return; //Retornamos al cargar el componente por primera vez, cuando data vale null

		showSpinner(false);
		showElement(data && data.length >= 0); //Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos

		//eslint-disable-next-line
	}, [data]);

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
		const { name, value } = e.target;
		setFilter((current) => ({
			...current,
			[name]: value,
		}));
	};

	const handleFilterCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setFilter((current) => ({
			...current,
			[name]: checked,
		}));
	};

	const adjustFiltersHeight = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (
			filtersCont &&
			filtersCont.style.maxHeight !== '' &&
			filtersCont.style.maxHeight !== '0px'
		) {
			filtersCont.style.maxHeight = filtersCont.scrollHeight + 'px';
		}
	};

	useEffect(() => {
		window.addEventListener('resize', adjustFiltersHeight);
		return () => window.removeEventListener('resize', adjustFiltersHeight);
	}, []);

	useEffect(() => {
		if (firstRenderForSaveFilter.current) {
			//Con el primer render salimos para que no se cargue en el filtro guardado los valores limpios
			firstRenderForSaveFilter.current = false;
			return;
		}

		localStorage.setItem('productsListFilter', JSON.stringify(filter)); //Cada vez que se modifica el filtro lo guardamos en el localstorage
	}, [filter]);

	return (
		<PageWrapper name='Products List' className='elementToShow'>
			<Subheader className='productsList_header_cont'>
				<SubheaderLeft>
					<FieldWrap
						className='mr-4'
						firstSuffix={<Icon className='mx-2' icon='HeroMagnifyingGlass' />}
						lastSuffix={
							globalFilter && (
								<Icon
									icon='HeroXMark'
									color='red'
									className='mx-2 cursor-pointer'
									onClick={() => {
										setGlobalFilter('');
									}}
								/>
							)
						}>
						<Input
							id='example'
							name='example'
							placeholder='Buscar...'
							value={globalFilter ?? ''}
							onChange={(e) => {
								table.initialState.pagination = {
									...table.getState().pagination,
									pageIndex: 0,
								}; //Al buscar con el filtro volvemos a la pagina inicial
								setGlobalFilter(e.target.value);
							}}
							className='productsListSearchInput'
						/>
					</FieldWrap>
					<Button
						variant='solid'
						icon='HeroFunnel'
						color='emerald'
						onClick={handleShowFilters}
						className='productsList_filter_search_button mr-4'>
						{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
					</Button>
				</SubheaderLeft>
				<SubheaderRight>
					<Link to='/sales/product/new'>
						<Button variant='solid' icon='HeroPlus'>
							Nuevo Producto
						</Button>
					</Link>
				</SubheaderRight>
			</Subheader>
			<Container className='productsList_filter_mainCont my-4 py-0'>
				<div className='productsList_filter_cont dflex wrap rounded-xl p-4'>
					<div>
						<Label htmlFor='categoria'>Categoría</Label>
						<Select
							name='categoria'
							onChange={handleFilterChange}
							value={filter.categoria}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							{filterData.categoriesList.map((category, index) => (
								<option key={index + 1} value={category.id.toString()}>
									{category.nombre}
								</option>
							))}
						</Select>
					</div>
					<div className=''>
						<Label htmlFor='marca'>Marca</Label>
						<Select
							name='marca'
							onChange={handleFilterChange}
							value={filter.marca}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							{filterData.brandsList.map((brand, index) => (
								<option key={index + 1} value={brand.descripcion}>
									{brand.descripcion}
								</option>
							))}
						</Select>
					</div>
					<div>
						<Label htmlFor='codigo'>Código</Label>
						<Input
							id='codigo'
							name='codigo'
							value={filter.codigo}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='nombre'>Nombre</Label>
						<Input
							id='nombre'
							name='nombre'
							value={filter.nombre}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='descripcion'>Descripción</Label>
						<Input
							id='descripcion'
							name='descripcion'
							value={filter.descripcion}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='fecha_alta'>Fecha de alta</Label>
						<Input
							id='fecha_alta'
							name='fecha_alta'
							value={filter.fecha_alta}
							onChange={handleFilterChange}
							type='date'
							className='productsListInputOrSelect'
						/>
					</div>

					<div className=''>
						<Label htmlFor='estado'>Estado</Label>
						<Select
							name='estado'
							onChange={handleFilterChange}
							value={filter.estado}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>
							<option key={1} value='1'>
								Habilitado
							</option>
							<option key={2} value='0'>
								Deshabilitado
							</option>
						</Select>
					</div>

					<div>
						<Label htmlFor='order'>Orden</Label>
						<Input
							id='order'
							name='order'
							value={filter.order}
							onChange={handleFilterChange}
							type='number'
							className='productsListInputOrSelect'
						/>
					</div>
					<div className='productsListInputOrSelect_checkBox_cont'>
						<Label htmlFor='new'>Novedades</Label>
						<Checkbox
							name='new'
							onChange={handleFilterCheckChange}
							checked={filter.new === true}
							className='productsListInputOrSelect_checkBox !py-0'
						/>
					</div>
					<div className='productsListInputOrSelect_checkBox_cont'>
						<Label htmlFor='inOrders'>En pedidos</Label>
						<Checkbox
							name='inOrders'
							onChange={handleFilterCheckChange}
							checked={filter.inOrders === true}
							className='productsListInputOrSelect_checkBox !py-0'
						/>
					</div>
					<div className='dflex productsList_filter_buttons_cont'>
						<Button
							variant='solid'
							icon='HeroMagnifyingGlass'
							onClick={() =>
								applyFilter({
									filter,
									productsInitialData: initialData.current || [],
									setData,
								})
							}
							className='productsList_filter_search_button'
							color='emerald'>
							Buscar
						</Button>
						<Button
							variant='solid'
							color='amber'
							icon='HeroArrowPath'
							onClick={resetFilter}
							className='productsList_filter_search_button'>
							Resetear filtros
						</Button>
					</div>
				</div>
			</Container>
			<Container className='pt-0'>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Lista de Productos</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} items
							</Badge>
						</CardHeaderChild>
					</CardHeader>
					<CardBody className='overflow-auto'>
						<TableTemplate className='table-fixed max-md:min-w-[70rem]' table={table} />
					</CardBody>
					<TableCardFooterTemplate table={table} />
				</Card>
			</Container>
		</PageWrapper>
	);
};

export default ProductJoyasListPage;
