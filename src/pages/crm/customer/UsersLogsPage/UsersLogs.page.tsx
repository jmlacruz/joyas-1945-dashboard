import React, { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { showModal1 } from '../../../../features/modalSlice';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../../components/layouts/Container/Container';

import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Icon from '../../../../components/icon/Icon';
import Input from '../../../../components/form/Input';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';
import Badge from '../../../../components/ui/Badge';
import Subheader, {
	SubheaderLeft,
} from '../../../../components/layouts/Subheader/Subheader';
import Tooltip from '../../../../components/ui/Tooltip';

import FieldWrap from '../../../../components/form/FieldWrap';
import { deleteRowByID, getTable } from '../../../../services/database';
import { Log } from '../../../../types/DASHBOARD/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { formatDateTime, getDayRange, isValidJSON } from '../../../../utils/utils';
import Label from '../../../../components/form/Label';
import { LogsListFilter } from '../../../../types/DASHBOARD';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/form/Select';


const columnHelper = createColumnHelper <Log> ();

const tableData: {data: Log[], setData: React.Dispatch<React.SetStateAction<Log[] | null>>} = {data: [], setData: () => {}};

let columns: any[];

const getColumns = (options: {deleteOrderFunction: (orderId: number) => void}) => {
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor("email", {
			cell: (info) => <span>{info.getValue() || "Email no ingresado"}</span>,
			header: 'Email',
			footer: 'Email',
			id: "email"
		}),
		columnHelper.accessor("password", {
			cell: (info) => <span>{info.getValue() || "Password no ingresado"}</span>,
			header: 'Contraseña',
			footer: 'Contraseña',
			id: "password"
		}),
		columnHelper.accessor("email", {
			cell: (info) => 
			info.row.original.id_usuario ?
			<Link to={`/crm/customer/${info.row.original.id_usuario}`}>
				<span className='underline text-blue-500'>{info.getValue()}</span>
			</Link> :
			<span>Email y/o contraseña inválidos</span>,
			header: 'Usuario',
			footer: 'Usuario',
			id: "usuario"
		}),
		columnHelper.accessor("ingreso", {
			cell: (info) => <span style={{textTransform: "capitalize"}}>{info.getValue()}</span>,
			header: 'Ingreso',
			footer: 'Ingreso',
			id: "ingreso"
		}),
		columnHelper.accessor('ip', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'IP',
			footer: 'IP',
			id: "ip"
		}),
		columnHelper.accessor('origen', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Origen',
			footer: 'Origen',
			id: "origen"
		}),
		columnHelper.accessor("date", {
			cell: (info) => <span>{formatDateTime(info.getValue())}</span>,
			header: 'Fecha',
			footer: 'Fecha',
			id: "date"
		}),
		columnHelper.accessor('id', {
			cell: (info) => 
				<div className='dflex wh100' onClick={() => options.deleteOrderFunction(info.row.original.id)}>
					<Tooltip text='Eliminar Log'>
						<Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed'/>
					</Tooltip>
				</div>,
			header: '',
			footer: '',
			enableSorting: false,
			id: "id2"
		}),
	];
};

const filterClearValues: LogsListFilter = {
	email: "",
    ip: "",
    password: "",
    ingreso: "",
    from: "",	
    to: "",
};

const applyFilter = (data: {filter: LogsListFilter, usersInitialData: Log[], setData: React.Dispatch<React.SetStateAction<Log[] | null>>}) => {
	const {filter, usersInitialData, setData} = data;
	let dataFiltered: Log[] = structuredClone(usersInitialData);

	if (filter.email) dataFiltered = dataFiltered.filter((log) => log.email.trim().includes(filter.email.trim()));																	
	if (filter.password) dataFiltered = dataFiltered.filter((log) => log.password.trim().includes(filter.password.trim()));
	if (filter.ingreso) dataFiltered = dataFiltered.filter((log) => log.ingreso === filter.ingreso);
	if (filter.ip) dataFiltered = dataFiltered.filter((log) => log.ip.trim().includes(filter.ip.trim()));

	if (filter.from && !filter.to) {
		const {startOfDay} = getDayRange(filter.from);
		dataFiltered = dataFiltered.filter((log) => log.time > startOfDay);
	} else if (!filter.from && filter.to) {
		const {endOfDay} = getDayRange(filter.to);
		dataFiltered = dataFiltered.filter((log) => log.time < endOfDay);
	} else if (filter.from && filter.to) {
		const {startOfDay} = getDayRange(filter.from);
		const {endOfDay} = getDayRange(filter.to);
		dataFiltered = dataFiltered.filter((log) => log.time > startOfDay && log.time < endOfDay);
	}

	setData(dataFiltered);
};

const UsersLogsPage = () => {
	
	const firstTime = useRef(true);  
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	
	const [data, setData] = useState <Log[] | null> (null);
	const {showSpinner} = useContext(SpinnerContext);
	const {setModal2} = useContext(Modal2Context);
	const dispatch = useDispatch();

	const firstRenderForSaveFilter = useRef(true);
	const initialData = useRef<Log[] | null>(null);
	const [filter, setFilter] = useState <LogsListFilter> (filterClearValues);
	const [showFilters, setShowFilters] = useState(false);

	const handleShowFilters = () => {
		const filtersCont = document.querySelector(".productsList_filter_mainCont") as HTMLDivElement;
		if (filtersCont) {
			filtersCont.style.transitionDuration = "0.5s";
			if (filtersCont.style.maxHeight === "" || filtersCont.style.maxHeight === "0px") {
				setShowFilters(true);
				filtersCont.style.maxHeight = filtersCont.scrollHeight + "px";
				localStorage.setItem("logsListShowFilters", JSON.stringify(true));
			}  else {
				setShowFilters(false);
				filtersCont.style.maxHeight = "0px";
				localStorage.setItem("logsListShowFilters", JSON.stringify(false));
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
		applyFilter({filter: filterClearValues, usersInitialData: initialData.current ||[], setData});
	};
		
	const deleteLogFunc = async (options: {logID: number}) => {
		showSpinner(true);

		const response = await deleteRowByID({tableName: "log", "rowID": options.logID});
		if (response.success && response.data >= 1) {																				//La base de datos devuelve el número de filas eliminadas
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó el logcon ID ${options.logID}`, icon: "success" } }));
		} else if (response.success && response.data === 0) {																		//Si no se eliminó ninguna fila la base devuelve 0
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar el log", subtitle: "Intente nuevamente", icon: "error" } }));
			showSpinner(false);
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar el log. Intente nuevamente", subtitle: response.message, icon: "error" } }));
			showSpinner(false);
		}
		
	};
	
	if (firstTime.current) {																			//Función que sete por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(
			{ deleteOrderFunction: (logID: number) => setModal2(
				{	show: true, 
					title: "Eliminación de log", 
					icon: "warning",
					subtitle: `Se eliminará el log con ID: ${logID}. Desea continuar?`, 
					firstButtonText: "Cancelar", 
					secondButtonText: "Confirmar", 
					firstButtonFunction: () => setModal2({ show: false }),
					secondButtonFunction: () => deleteLogFunc({logID}),
				}) 
			});
	} 
	  		
	const table = useReactTable({
		data: data || [],
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		enableGlobalFilter: true,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 20 },
		},
	});
	
	useEffect(() => {																																		//Leemos la base de datos
		showSpinner(true);																								
		
		(async () => {
			const response1 = await getTable({tableName: "log"});																							
			if (response1.success && response1.data && response1.data.length) {
				const logsData: Log[] = response1.data;
	
				initialData.current = logsData;

				const usersListShowFiltersJSON = localStorage.getItem("logsListShowFilters");
				const usersListShowFiltersOBJ = usersListShowFiltersJSON && isValidJSON(usersListShowFiltersJSON) ? JSON.parse(usersListShowFiltersJSON) : null;
				usersListShowFiltersOBJ ? openFilters() : closeFilters();

				const savedFilterJSON = localStorage.getItem("logsListFilters");
				const savedFilterOBJ: LogsListFilter = savedFilterJSON && isValidJSON(savedFilterJSON) ? JSON.parse(savedFilterJSON) : null;
				if (savedFilterOBJ) {
					setFilter(savedFilterOBJ);
					applyFilter({filter: savedFilterOBJ, usersInitialData: initialData.current || [], setData});
				} else {
					applyFilter({filter, usersInitialData: initialData.current || [], setData});
				}

			} else {
				dispatch(showModal1({ show: true, info: { title: "Error al renderizar la tabla", subtitle: response1.message, icon: "error" } }));
				showSpinner(false);
			}
		})();
		//eslint-disable-next-line
	}, [toggleReloadTable])

	useEffect(() => {
		if (!data) return;

		tableData.data = structuredClone(data);
		tableData.setData = setData;
		setSorting([{ id: 'id', desc: true }]);									//Una vez recibidos los datos de la tabla se ordena por id en forma descendente
		showSpinner(false);

		//eslint-disable-next-line
	}, [data])

	const handleFilterChange = (e: React.ChangeEvent <HTMLSelectElement | HTMLInputElement>) => {
		const {name, value} = e.target;
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

		localStorage.setItem("logsListFilters", JSON.stringify(filter));					//Cada vez que se modifica el filtro lo guardamos en el localstorage
	}, [filter]);	
		
	return (
		<PageWrapper name='Listado de pedidos'>
			<Subheader>
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
							onChange={(e) => setGlobalFilter(e.target.value)}
						/>
					</FieldWrap>
					<Button variant='solid' icon='HeroFunnel' color='emerald' onClick={handleShowFilters} className='productsList_filter_search_button mr-4'>
						{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
					</Button>
					<Button variant='solid' icon='HeroArrowPath' color='blue' onClick={() => setToggleReloadTable((current) => !current)} className='productsList_filter_search_button mr-4'>
						Actualizar tabla
					</Button>
				</SubheaderLeft>
			</Subheader>
			<Container className='productsList_filter_mainCont py-0 my-4'>
				<div className='productsList_filter_cont dflex wrap p-4 rounded-xl'>
					<div>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							name='email'
							value={filter.email}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ip'>IP</Label>
						<Input
							id='ip'
							name='ip'
							value={filter.ip}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>Contraeña</Label>
						<Input
							id='password'
							name='password'
							value={filter.password}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ingreso'>Ingreso</Label>
						<Select
							id='ingreso'
							name='ingreso'
							value={filter.ingreso}
							onChange={handleFilterChange}
							className='productsListInputOrSelect'
						>
							<option value="" key={0}></option>
							<option value="ok" key={1}>Ok</option>
							<option value="error" key={2}>Error</option>
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
							onClick={() => applyFilter({ filter, setData, usersInitialData: initialData.current || [] })}
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
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Logs de usuarios</CardTitle>
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

export default UsersLogsPage;
