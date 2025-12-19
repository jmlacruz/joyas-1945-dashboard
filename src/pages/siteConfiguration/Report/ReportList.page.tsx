import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import "./reportList.page.css";
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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { showModal1 } from '../../../features/modalSlice';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';

import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/form/Input';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';
import Badge from '../../../components/ui/Badge';
import Subheader, {
	SubheaderLeft,
} from '../../../components/layouts/Subheader/Subheader';

import FieldWrap from '../../../components/form/FieldWrap';
import { getTable } from '../../../services/database';
import { BrandsData, Detalle, Log, Marca, Pedidos, Producto, Reporte, Usuario } from '../../../types/DASHBOARD/database';
import { SpinnerContext } from '../../../context/spinnerContext';
import { convertToNoon, formatDateToString, getCurrentDate, getDayRange, getMonthAndYearRange, getOneMonthAgo, getYearRange, insertDotsInPrice, isValidJSON, showElement } from '../../../utils/utils';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import { ReportsListFilter } from '../../../types/DASHBOARD';
import { monthsList } from '../../../data';

const columnHelper = createColumnHelper<Reporte>();
const paginationInitialState: PaginationState = { pageIndex: 0, pageSize: 20 };

type ActiveBransData = { brandName: string, brandID: number }
type FilterData = {
	allLogsData: Log[];
	allUsersData: Usuario[];
	allOrdersData: Pedidos[];
	allDetailsData: Detalle[];
	activeBrandsData: ActiveBransData[];
	allProductsData: Producto[];
}

const applyFilter = (data: { filter: ReportsListFilter, setData: React.Dispatch<React.SetStateAction<Reporte[] | null>>, filterData: FilterData }) => {
	const { filter, setData, filterData } = data;

	let logsDataFiltered = structuredClone(filterData.allLogsData);																//Filtramos tabla de logs por año y/o mes o por fechas
	if (filter.month) {
		const year = parseInt(filter.year) || new Date().getFullYear();
		const { from, to } = getMonthAndYearRange(filter.month, year);
		logsDataFiltered = logsDataFiltered.filter((log) => log.time > from && log.time < to);
	} else if (!filter.month && filter.year) {
		const { from, to } = getYearRange(parseInt(filter.year));
		logsDataFiltered = logsDataFiltered.filter((log) => log.time > from && log.time < to);
	} else if (filter.from && !filter.to) {
		const { startOfDay } = getDayRange(filter.from);
		logsDataFiltered = logsDataFiltered.filter((log) => log.time > startOfDay);
	} else if (!filter.from && filter.to) {
		const { endOfDay } = getDayRange(filter.to);
		logsDataFiltered = logsDataFiltered.filter((log) => log.time < endOfDay);
	} else if (filter.from && filter.to) {
		const { startOfDay } = getDayRange(filter.from);
		const { endOfDay } = getDayRange(filter.to);
		logsDataFiltered = logsDataFiltered.filter((log) => log.time > startOfDay && log.time < endOfDay);
	}
	const logUsersUniqueIds = [...new Set(logsDataFiltered.map(item => item.id_usuario))];										//Genera un array de Ids de productos no repetidos del resultado del filtro

	let ordersDataFiltered = structuredClone(filterData.allOrdersData);															//Filtramos tabla de pedidos por año y/o mes o por fechas
	if (filter.month) {
		const year = parseInt(filter.year) || new Date().getFullYear();
		const { from, to } = getMonthAndYearRange(filter.month, year);
		ordersDataFiltered = ordersDataFiltered.filter((order) => convertToNoon(order.fecha) > from && convertToNoon(order.fecha) < to);
	} else if (!filter.month && filter.year) {
		const { from, to } = getYearRange(parseInt(filter.year));
		ordersDataFiltered = ordersDataFiltered.filter((order) => convertToNoon(order.fecha) > from && convertToNoon(order.fecha) < to);
	} else if (filter.from && !filter.to) {
		const { startOfDay } = getDayRange(filter.from);
		ordersDataFiltered = ordersDataFiltered.filter((order) => convertToNoon(order.fecha) > startOfDay);
	} else if (!filter.from && filter.to) {
		const { endOfDay } = getDayRange(filter.to);
		ordersDataFiltered = ordersDataFiltered.filter((order) => convertToNoon(order.fecha) < endOfDay);
	} else if (filter.from && filter.to) {
		const { startOfDay } = getDayRange(filter.from);
		const { endOfDay } = getDayRange(filter.to);
		ordersDataFiltered = ordersDataFiltered.filter((order) => convertToNoon(order.fecha) > startOfDay && convertToNoon(order.fecha) < endOfDay);
	}

	const dataParsed: Reporte[] = logUsersUniqueIds.map((userID) => {
		const name = filterData.allUsersData.find((user) => user.id === userID)?.nombre || "";
		const lastName = filterData.allUsersData.find((user) => user.id === userID)?.apellido || "";

		const entriesQuantity = logsDataFiltered.filter((log) => log.id_usuario === userID).length;

		const allLogs = logsDataFiltered.filter((log) => log.id_usuario === userID);
		const allLogsTimestamps = allLogs.map((log) => log.time);
		const lastLogTimestamp = Math.max(...allLogsTimestamps);

		const orders = ordersDataFiltered.filter((order) => order.usuario === userID);
		const ordersQuantity = orders.length;
		const ordersTotal = orders.reduce((total, order) => total + order.total, 0);
		const ordersIDsArr = orders.map((order) => order.id);
		const details = filterData.allDetailsData.filter((detail) => ordersIDsArr.includes(detail.id_pedido));
		const articlesQuantity = details.reduce((total, detail) => total + detail.cantidad, 0);

		const brandsData: BrandsData[] = filterData.activeBrandsData.map((brand) => {

			const articles = details.filter((detail) => {
				const productBrandID = filterData.allProductsData.find((product) => product.id === detail.id_producto)?.marca;
				return productBrandID === brand.brandID;
			});

			const articlesAmount = articles.reduce((total, detail) => total + detail.cantidad, 0);

			const amount = articles.reduce((total, detail) => total + detail.total, 0);

			return {
				brandName: brand.brandName,
				brandID: brand.brandID,
				articulos: articlesAmount,
				monto: amount
			};
		});

		return {
			nombre: name,
			apellido: lastName,
			userID,
			ingresos: entriesQuantity,
			ultimoIngreso: lastLogTimestamp,
			articulos: articlesQuantity,
			monto: ordersTotal,
			pedidos: ordersQuantity,
			brandsData
		};
	});

	setData(dataParsed);
};

const filterClearValues: ReportsListFilter = {
	year: "",
	month: "",
	from: getOneMonthAgo(),
	to: getCurrentDate(),
};

const ReportListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([{ id: 'ultimoIngreso', desc: true }]);
	const [globalFilter, setGlobalFilter] = useState<string>('');

	const [data, setData] = useState<Reporte[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);
	const dispatch = useDispatch();
	const firstRender = useRef(true);
	const firstRenderForSaveFilter = useRef(true);
	const navigate = useNavigate();
	const thisLocation = useLocation();
	const [brandsColumnsData, setBrandsColumnsData] = useState<ActiveBransData[] | null>(null);

	const [filter, setFilter] = useState<ReportsListFilter>(filterClearValues);
	const filterData = useRef<FilterData>({
		allLogsData: [],
		allUsersData: [],
		allOrdersData: [],
		allDetailsData: [],
		activeBrandsData: [],
		allProductsData: [],
	});
	const [showFilters, setShowFilters] = useState(false);

	const handleShowFilters = () => {
		const filtersCont = document.querySelector(".productsList_filter_mainCont") as HTMLDivElement;
		if (filtersCont) {
			filtersCont.style.transitionDuration = "0.5s";
			if (filtersCont.style.maxHeight === "" || filtersCont.style.maxHeight === "0px") {
				setShowFilters(true);
				filtersCont.style.maxHeight = filtersCont.scrollHeight + "px";
				localStorage.setItem("reportListShowFilters", JSON.stringify(true));
			} else {
				setShowFilters(false);
				filtersCont.style.maxHeight = "0px";
				localStorage.setItem("reportListShowFilters", JSON.stringify(false));
			}
		}
	};

	const openFilters = () => {
		const filtersCont = document.querySelector(".productsList_filter_mainCont") as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(true);
			filtersCont.style.transitionDuration = "0s";
			filtersCont.style.maxHeight = filtersCont.scrollHeight + "px";
		}
	};

	const closeFilters = () => {
		const filtersCont = document.querySelector(".productsList_filter_mainCont") as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(false);
			filtersCont.style.transitionDuration = "0s";
			filtersCont.style.maxHeight = "0px";
		}
	};

	const resetFilter = () => {
		setFilter(filterClearValues);
		applyFilter({ filter: filterClearValues, setData, filterData: filterData.current });
		navigate(thisLocation.pathname);																												//Borra querys de la url
	};

	const columns = useMemo<ColumnDef<Reporte, any>[]>(
		() => {
			const sumRows = (key: keyof Reporte): number => {
				if (!data || data.length === 0) return 0;
				return data.reduce((total, row) => total + (typeof row[key] === "number" ? row[key] as number : 0), 0);
			};

			return [
				columnHelper.accessor('nombre', {
					cell: (info) =>
						<Link className='underline text-blue-500' to={`/crm/customer/${info.row.original.userID}`}>
							<span>{info.getValue()}</span>
						</Link>,
					header: 'Nombre',
					id: "id"
				}),
				columnHelper.accessor('apellido', {
					cell: (info) =>
						<Link className='underline text-blue-500' to={`/crm/customer/${info.row.original.userID}`}>
							<span>{info.getValue()}</span>
						</Link>,
					header: 'Apellido',
					id: "apellido"
				}),
				columnHelper.accessor('ingresos', {
					cell: (info) => <span>{info.getValue()}</span>,
					header: 'Ingresos',
					id: "ingresos",
				}),
				columnHelper.accessor('ultimoIngreso', {
					cell: (info) => <span>{formatDateToString(info.getValue() as number)}</span>,
					header: 'Último ingreso',
					footer: "TOTALES",
					id: "ultimoIngreso",
				}),
				columnHelper.accessor('pedidos', {
					cell: (info) => <span>{info.getValue() as number}</span>,
					header: 'Pedidos',
					footer: () => sumRows("pedidos"),
					id: "pedidos"
				}),
				columnHelper.accessor('articulos', {
					cell: (info) => <span>{info.getValue() as number}</span>,
					header: 'Artículos',
					footer: () => sumRows("articulos"),
					id: "articulos",
				}),
				columnHelper.accessor('monto', {
					cell: (info) => <span>{insertDotsInPrice(info.getValue() as number)}</span>,
					header: 'Monto total',
					footer: () => insertDotsInPrice(sumRows("monto")),
					id: "monto"
				}),
				...(brandsColumnsData ? brandsColumnsData.map((brand, index) =>																			//Agregamos dinamicamente una columna por marca activa
				({
					header: brand.brandName,
					columns: [
						columnHelper.accessor('brandsData', {
							cell: (info) => <span>{info.getValue().find((el) => el.brandName === brand.brandName)?.articulos}</span>,
							header: 'Artículos',
							footer: () => {
								const total = data?.reduce((sum, row) => {
									const brandData = row.brandsData?.find((el) => el.brandName === brand.brandName);
									return sum + (brandData?.articulos || 0);
								}, 0);
								return insertDotsInPrice(total || 0);
							},
							id: "articulos" + index,
						}),
						columnHelper.accessor('brandsData', {
							cell: (info) => <span>{insertDotsInPrice(info.getValue().find((el) => el.brandName === brand.brandName)?.monto || 0)}</span>,
							header: 'Monto',
							footer: () => {
								const total = data?.reduce((sum, row) => {
									const brandData = row.brandsData?.find((el) => el.brandName === brand.brandName);
									return sum + (brandData?.monto || 0);
								}, 0);
								return insertDotsInPrice(total || 0);
							},
							id: "monto" + index,
						}),
					],
				}))
					:
					[]
				)
			];
		},
		[brandsColumnsData, data]
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

	useEffect(() => {																																		//Leemos la base de datos

		if (firstRender.current) {																															//Activamos el spinner solo al entrar en la pagina 
			firstRender.current = false;
			showSpinner(true);
		}

		(async () => {
			const logFields: (keyof Log)[] = ["id_usuario", "time"];
			const response1 = await getTable({ tableName: "log", fields: logFields });																		//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			if (!response1.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de vendedores. ${response1.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allLogsData: Log[] = response1.data;

			const fieldsUsersList: Array<keyof Partial<Usuario>> = ["nombre", "apellido", "id"];
			const response2 = await getTable({ tableName: "usuario", fields: fieldsUsersList });
			if (!response2.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de usuarios. ${response2.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allUsersData: Usuario[] = response2.data;

			const allOrdersFields: (keyof Pedidos)[] = ['id', 'usuario', 'total', 'fecha'];
			const response3 = await getTable({ tableName: "pedidos", fields: allOrdersFields });
			if (!response3.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de pedidos. ${response3.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allOrdersData: Pedidos[] = response3.data;

			const allDetailsFields: (keyof Detalle)[] = ["id_pedido", "cantidad", "id_producto", "total"];
			const response4 = await getTable({ tableName: "detalle", fields: allDetailsFields });
			if (!response4.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de detalles. ${response4.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allDetailsData: Detalle[] = response4.data;

			const allBrandsFields: (keyof Marca)[] = ["descripcion", "id"];
			const response5 = await getTable({ tableName: "marca", fields: allBrandsFields, conditions: [{ field: "estado", value: "1" }] });
			if (!response5.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de marcas. ${response5.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allBrandsData: Marca[] = response5.data;
			const activeBrandsData = allBrandsData.map((brand) => ({ brandName: brand.descripcion, brandID: brand.id }));
			setBrandsColumnsData(activeBrandsData);

			const productsFields: (keyof Producto)[] = ["id", "marca"];
			const response6 = await getTable({ tableName: "producto", fields: productsFields });
			if (!response6.success) {
				dispatch(showModal1({ show: true, info: { title: "Error", subtitle: `No se pudo obtener la lista de productos. ${response6.message}`, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const allProductsData: Producto[] = response6.data;

			filterData.current = {
				allLogsData,
				allOrdersData,
				allUsersData,
				allDetailsData,
				activeBrandsData,
				allProductsData
			};

			const usersListShowFiltersJSON = localStorage.getItem("reportListShowFilters");
			const usersListShowFiltersOBJ = usersListShowFiltersJSON && isValidJSON(usersListShowFiltersJSON) ? JSON.parse(usersListShowFiltersJSON) : null;
			usersListShowFiltersOBJ ? openFilters() : closeFilters();

			const savedFilterJSON = localStorage.getItem("reportListFilter");
			const savedFilterOBJ: ReportsListFilter = savedFilterJSON && isValidJSON(savedFilterJSON) ? JSON.parse(savedFilterJSON) : null;
			if (savedFilterOBJ) {
				setFilter(savedFilterOBJ);
				if (!savedFilterOBJ.from && !savedFilterOBJ.to) {																	//Si hay filtro guardado en el localstorage y si el dia inicial y el dia final no estan seteados ponemos la fecha actual en ambos
					savedFilterOBJ.from = getCurrentDate();
					savedFilterOBJ.to = getCurrentDate();
				}
				applyFilter({ filter: savedFilterOBJ, setData, filterData: filterData.current });
			} else {																												//Si no hay filtro guardado en el localstorage ponemos la fecha actual en el dia inicial y final
				filter.to = getCurrentDate();
				filter.from = getCurrentDate();
				applyFilter({ filter, setData, filterData: filterData.current });
			}

		})();
		//eslint-disable-next-line
	}, [thisLocation])

	useEffect(() => {																												//Se setean los headers de marcas para ocupar 2 columnas
		const brandNames = filterData.current.activeBrandsData.map((el) => el.brandName);

		const thList = document.querySelectorAll("th") as NodeListOf<HTMLElement>;
		const thArr = Array.from(thList);

		brandNames.forEach((brandName) => {
			const th = thArr.find((ths) => ths.textContent === brandName);
			if (!th) return;
			th.setAttribute("colSpan", "2");
			th.classList.add("reportList_headers");
		});
	}, [filterData.current.activeBrandsData]);

	useEffect(() => {
		if (!data) return;

		showSpinner(false);
		showElement(true);																												//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos

		//eslint-disable-next-line
	}, [data])

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
		const { name, value } = e.target;
		setFilter((current) => ({
			...current,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (firstRenderForSaveFilter.current) {												//Con el primer render salimos para que no se cargue en el filtro guardado los valores limpios
			firstRenderForSaveFilter.current = false;
			return;
		}

		localStorage.setItem("reportListFilter", JSON.stringify(filter));					//Cada vez que se modifica el filtro lo guardamos en el localstorage
	}, [filter]);

	return (
		<PageWrapper name='Reporte' className='elementToShow reportList_section'>
			<Subheader className='productsList_header_cont'>
				<SubheaderLeft>
					<FieldWrap
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
								table.initialState.pagination = { ...table.getState().pagination, pageIndex: 0 };								//Al buscar con el filtro volvemos a la pagina inicial
								setGlobalFilter(e.target.value);
							}}
						/>
					</FieldWrap>
					<Button variant='solid' icon='HeroFunnel' color='emerald' onClick={handleShowFilters} className='productsList_filter_search_button mr-4'>
						{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
					</Button>
				</SubheaderLeft>
			</Subheader>
			<Container className='productsList_filter_mainCont py-0 my-4'>
				<div className='productsList_filter_cont dflex wrap p-4 rounded-xl'>
					<div>
						<Label htmlFor='year'>Año</Label>
						<Input
							id='year'
							name='year'
							value={filter.year}
							onChange={handleFilterChange}
							type='number'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='month'>Mes</Label>
						<Select
							id='month'
							name='month'
							value={filter.month}
							onChange={handleFilterChange}
							className='productsListInputOrSelect'
						>
							<option value="" key={0}></option>
							{monthsList.map((month, index) =>
								<option key={index + 1} value={month}>{month}</option>
							)}
						</Select>
					</div>
					<div>
						<Label htmlFor='from'>Desde</Label>
						<Input
							id='from'
							name='from'
							value={filter.from}
							onChange={handleFilterChange}
							type="date"
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='to'>Hasta</Label>
						<Input
							id='to'
							name='to'
							value={filter.to}
							onChange={handleFilterChange}
							type="date"
							className='productsListInputOrSelect'
						/>
					</div>
					<div className='dflex productsList_filter_buttons_cont'>
						<Button
							variant='solid'
							icon='HeroMagnifyingGlass'
							onClick={() => applyFilter({ filter, setData, filterData: filterData.current })}
							className='productsList_filter_search_button'
							color='emerald'
						>
							Buscar
						</Button>
						<Button
							variant='solid'
							color='amber'
							icon='HeroArrowPath'
							onClick={resetFilter}
							className='productsList_filter_search_button'
						>
							Resetear filtros
						</Button>
					</div>
				</div>
			</Container>
			<Container className='pt-0'>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Reporte</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} registros
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

export default ReportListPage;
