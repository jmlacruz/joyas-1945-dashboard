import React, { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { showModal1 } from '../../../features/modalSlice';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';

import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
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
import { Log_envio, NotificationsLogsListFilter } from '../../../types/DASHBOARD/database';
import { SpinnerContext } from '../../../context/spinnerContext';
import { getDayRange, isValidJSON, timestampToDateAndHour } from '../../../utils/utils';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/Button';
import Select from '../../../components/form/Select';
import { getTable } from '../../../services/database';
import { notificationsTypesList } from '../../../data';

const columnHelper = createColumnHelper <Log_envio> ();
const tableData: {data: Log_envio[], setData: React.Dispatch<React.SetStateAction<Log_envio[] | null>>} = {data: [], setData: () => {}};
let columns: any[];

const getColumns = () => {
	columns = [
		columnHelper.accessor('notificationType', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Tipo de notificación',
			footer: 'Tipo de notificación',
			id: "id"
		}),
		columnHelper.accessor("recipients", {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Destinatario/s',
			footer: 'Destinatario/s',
			id: "recipients"
		}),
		columnHelper.accessor("timestamp", {
			cell: (info) => <span>{timestampToDateAndHour(info.getValue())}</span>,
			header: 'Fecha',
			footer: 'Fecha',
			id: "timestamp"
		}),
	];
};

const filterClearValues: NotificationsLogsListFilter = {
	notificationType: "",
    recipients: "",
    from: "",	
    to: "",
};

const applyFilter = (data: {filter: NotificationsLogsListFilter, usersInitialData: Log_envio[], setData: React.Dispatch<React.SetStateAction<Log_envio[] | null>>}) => {
	const {filter, usersInitialData, setData} = data;
	let dataFiltered: Log_envio[] = structuredClone(usersInitialData);

	if (filter.notificationType) dataFiltered = dataFiltered.filter((log) => log.notificationType === filter.notificationType);
	if (filter.recipients) dataFiltered = dataFiltered.filter((log) => log.recipients.trim().includes(filter.recipients));

	if (filter.from && !filter.to) {
		const {startOfDay} = getDayRange(filter.from);
		dataFiltered = dataFiltered.filter((log) => log.timestamp > startOfDay);
	} else if (!filter.from && filter.to) {
		const {endOfDay} = getDayRange(filter.to);
		dataFiltered = dataFiltered.filter((log) => log.timestamp < endOfDay);
	} else if (filter.from && filter.to) {
		const {startOfDay} = getDayRange(filter.from);
		const {endOfDay} = getDayRange(filter.to);
		dataFiltered = dataFiltered.filter((log) => log.timestamp > startOfDay && log.timestamp < endOfDay);
	}

	setData(dataFiltered);
};

const NotificationsLogsPage = () => {
	
	const firstTime = useRef(true);  
	const [sorting, setSorting] = useState<SortingState>([{id: "timestamp", desc: true}]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	
	const [data, setData] = useState <Log_envio[] | null> (null);
	const {showSpinner} = useContext(SpinnerContext);
	const dispatch = useDispatch();

	const firstRenderForSaveFilter = useRef(true);
	const initialData = useRef<Log_envio[] | null>(null);
	const [filter, setFilter] = useState <NotificationsLogsListFilter> (filterClearValues);
	const [showFilters, setShowFilters] = useState(false);

	const handleShowFilters = () => {
		const filtersCont = document.querySelector(".productsList_filter_mainCont") as HTMLDivElement;
		if (filtersCont) {
			filtersCont.style.transitionDuration = "0.5s";
			if (filtersCont.style.maxHeight === "" || filtersCont.style.maxHeight === "0px") {
				setShowFilters(true);
				filtersCont.style.maxHeight = filtersCont.scrollHeight + "px";
				localStorage.setItem("notificationsLogsListShowFilters", JSON.stringify(true));
			}  else {
				setShowFilters(false);
				filtersCont.style.maxHeight = "0px";
				localStorage.setItem("notificationsLogsListShowFilters", JSON.stringify(false));
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
	
	
	if (firstTime.current) {																			//Función que sete por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns();
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
			const response1 = await getTable({tableName: "log_envio"});																							
			if (response1.success && response1.data) {
				const logsData: Log_envio[] = response1.data;
	
				initialData.current = logsData;

				const usersListShowFiltersJSON = localStorage.getItem("notificationsLogsListShowFilters");
				const usersListShowFiltersOBJ = usersListShowFiltersJSON && isValidJSON(usersListShowFiltersJSON) ? JSON.parse(usersListShowFiltersJSON) : null;
				usersListShowFiltersOBJ ? openFilters() : closeFilters();

				const savedFilterJSON = localStorage.getItem("notificationsLogsListFilters");
				const savedFilterOBJ: NotificationsLogsListFilter = savedFilterJSON && isValidJSON(savedFilterJSON) ? JSON.parse(savedFilterJSON) : null;
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
	}, [])

	useEffect(() => {
		if (!data) return;

		tableData.data = structuredClone(data);
		tableData.setData = setData;
		setSorting([{ id: 'timestamp', desc: true }]);									//Una vez recibidos los datos de la tabla se ordena por id en forma descendente
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

		localStorage.setItem("notificationsLogsListFilters", JSON.stringify(filter));					//Cada vez que se modifica el filtro lo guardamos en el localstorage
	}, [filter]);	
		
	return (
		<PageWrapper name='Logs de envíos'>
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
				</SubheaderLeft>
			</Subheader>
			<Container className='productsList_filter_mainCont py-0 my-4'>
				<div className='productsList_filter_cont dflex wrap p-4 rounded-xl'>
					<div>
						<Label htmlFor='recipients'>Destinatario</Label>
						<Input
							id='recipients'
							name='recipients'
							value={filter.recipients}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='notificationType'>Tipo de notificación</Label>
						<Select
							id='notificationType'
							name='notificationType'
							value={filter.notificationType}
							onChange={handleFilterChange}
							className='productsListInputOrSelect min-w-80'
						>
							<option value="" key={0}></option>
							{
								notificationsTypesList.map((notificationType, index) => 
									<option value={notificationType} key={index}>{notificationType}</option>
								)
							}
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
							<CardTitle>Logs de envíos</CardTitle>
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

export default NotificationsLogsPage;
