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
import { Link } from 'react-router-dom';
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
import Tooltip from '../../../components/ui/Tooltip';

import FieldWrap from '../../../components/form/FieldWrap';
import { getTable, updateTable } from '../../../services/database';
import { Usuario, Config} from '../../../types/DASHBOARD/database';
import CheckBox1 from '../../../components/DASHBOARD/checkBoxs/CheckBox1';
import { SpinnerContext } from '../../../context/spinnerContext';
import { Modal1Icons } from '../../../types/DASHBOARD';

const columnHelper = createColumnHelper <Config> ();

const tableData: {data: Config[], setData: React.Dispatch<React.SetStateAction<Config[] | null>>} = {data: [], setData: () => {}};

let show_spinner: (show: boolean) => void;
let showModal: (title: string, message: string, icon: Modal1Icons) => void;

const enableNotification = async (enabled: boolean, data: Usuario) => {							//Función que se le pasa al check de habilitar usuario en la tabla de usuarios (para habilitar o deshabilitar un usuario)
	show_spinner(true);
	const response = await updateTable({tableName: "config", conditions: [{field: "id", value: data.id}], data: {activo: enabled ? "1": "0"}});
	if (response.success) {
		if (enabled) {
			showModal("Acción completada", `Notificación habilitada`, "success");
		} else {
			showModal("Acción completada", `Notificación deshabilitada`, "success");
		}
		
		const notificationToUpdateIndex = tableData.data.findIndex(notification => notification.id === data.id);
		if (notificationToUpdateIndex !== -1) {
			tableData.data[notificationToUpdateIndex].activo = enabled ? "1": "0";
			tableData.setData(tableData.data);
		} 

		show_spinner(false);
	} else {
		show_spinner(false);
		showModal("Error", `No se pudo ${enabled ? " habilitar": " deshabilitar"} la notificación: ${response.message}`, "error");
	}
};

const index = {value: 0};																	//Lógica para dar valores únicos a los ids de las columnas
const getIndex = () => {
	index.value += 1;
	return index.value;
};

let columns: any[];

const getColumns = () => {
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: getIndex().toString()
		}),
		columnHelper.accessor('seccion', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Sección',
			footer: 'Sección',
			id: getIndex().toString()
		}),
		columnHelper.accessor('asunto', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Asunto',
			footer: 'Asunto',
			id: getIndex().toString()
		}),
		columnHelper.accessor('destinatarios', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Destinatarios',
			footer: 'Destinatarios',
			id: getIndex().toString()
		}),
		columnHelper.accessor('activo', {
			cell: (info) =>  
				<Tooltip text={info.getValue() === "1" ? "Habilitado" : "Deshabilitado"}>
					<div className='dflex wh100 justify-start'>
						<CheckBox1 text='' checkedFunction={enableNotification} dataInput={info.row.original} defaultValue={info.getValue() === "1"} />
					</div >
				</Tooltip>,
			header: 'Activo',
			footer: 'Activo',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) => 
				<Link className='dflex wh100' to={`/siteConfiguration/messagingsettings/${info.getValue()}`}>
					<Tooltip text='Modificar'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>,
			header: '',
			footer: '',
			enableSorting: false,
			id: getIndex().toString()
		}),
	];
};

const MessagingsettingsListPage = () => {
	
	const firstTime = useRef(true);  
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [toggleReloadTable] = useState(true);
	
	const [data, setData] = useState <Config[] | null> (null);
	const {showSpinner} = useContext(SpinnerContext);
	show_spinner = (opc: boolean) => showSpinner(opc);
	const dispatch = useDispatch();

	showModal = (title: string, message: string, icon: Modal1Icons) => dispatch(showModal1({ show: true, info: { title, subtitle: message, icon } }));	//Función que muestra el modal al habilitar/deshabilitar usuario y se pasa a la funcion correspondiente que esta afuera del componente
			
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
			pagination: { pageSize: 10 },
		},
		// debugTable: true,
	});
	
	useEffect(() => {																																		//Leemos la base de datos
		showSpinner(true);																								

		(async () => {
				
			const response1 = await getTable({
				tableName: "config", 
				// limit: 10
			});
																																							
			if (response1.success && response1.data && response1.data.length) {
				const configData: Config[] = response1.data;
				setData(configData);
				
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
		showSpinner(false);
		//eslint-disable-next-line
	}, [data])
		
	return (
		<PageWrapper name='Customer List'>
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
				</SubheaderLeft>
			</Subheader>
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Configuración de mensajería</CardTitle>
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

export default MessagingsettingsListPage;
