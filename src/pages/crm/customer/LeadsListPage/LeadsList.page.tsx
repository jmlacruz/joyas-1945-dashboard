import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./leadsList.page.css";
import * as XLSX from "xlsx";
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
import Tooltip from '../../../../components/ui/Tooltip';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../../components/layouts/Container/Container';
import Badge from '../../../../components/ui/Badge';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Icon from '../../../../components/icon/Icon';
import Input from '../../../../components/form/Input';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '../../../../components/layouts/Subheader/Subheader';
import FieldWrap from '../../../../components/form/FieldWrap';
import { showModal1 } from '../../../../features/modalSlice';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';
import { Leads } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { showElement, waitAllImagesCharged } from '../../../../utils/utils';
import Button from '../../../../components/ui/Button';

const columnHelper = createColumnHelper <Leads> ();

const tableData: {data: Partial<Leads>[], setData: React.Dispatch<React.SetStateAction<Partial<Leads>[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

const index = {value: 0};																					//Lógica para dar valores únicos a los ids de las columnas
const getIndex = () => {
	index.value += 1;
	return index.value;
};

let columns: any[];																		   					//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningFordeleteNews: (leadId: number, leadEmail: string) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor('nombre', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Nombre',
			footer: 'Nombre',
			id: getIndex().toString()
		}),
		columnHelper.accessor('apellido', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Apellido',
			footer: 'Apellido',
			id: getIndex().toString()
		}),
		columnHelper.accessor('empresa', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Empresa',
			footer: 'Empresa',
			id: getIndex().toString()
		}),
		columnHelper.accessor('direccion', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Dirección',
			footer: 'Dirección',
			id: getIndex().toString()
		}),
		columnHelper.accessor('cp', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'CP',
			footer: 'CP',
			id: getIndex().toString()
		}),
		columnHelper.accessor('ciudad', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Ciudad',
			footer: 'Ciudad',
			id: getIndex().toString()
		}),
		columnHelper.accessor('provincia', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Provincia',
			footer: 'Provincia',
			id: getIndex().toString()
		}),
		columnHelper.accessor('pais', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'País',
			footer: 'País',
			id: getIndex().toString()
		}),
		columnHelper.accessor('telefono', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Teléfono',
			footer: 'Teléfono',
			id: getIndex().toString()
		}),
		columnHelper.accessor('email', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Email',
			footer: 'Email',
			id: getIndex().toString()
		}),
		columnHelper.accessor('celular', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Celular',
			footer: 'Celular',
			id: getIndex().toString()
		}),
		columnHelper.accessor('referencia', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Referencia',
			footer: 'Referencia',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/crm/lead/${info.getValue()}`}>
					<Tooltip text='Editar Lead'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>,
			header: '',
			footer: '',
			enableSorting: false,
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				{
					return (
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteNews(info.getValue(), info.row.original.email)}>
							<Tooltip text='Eliminar Lead'>
								<Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed' />
							</Tooltip>
						</div>
					);
				},
			header: '',
			footer: '',
			enableSorting: false,
			id: getIndex().toString()
		}),
	];
};

const LeadsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Partial<Leads>[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
					
		(async () => {
			
			const fields: (keyof Leads)[] = ["id", "nombre", "apellido", "empresa", "direccion", "cp", "ciudad", "provincia", "pais", "telefono", "email", "celular", "referencia"];
			const response = await getTable({ tableName: "leads", fields});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (!response.success || !response.data || !response.data.length) {
				dispatch(showModal1({ show: true, info: { title: "No se pudo renderizar la tabla", subtitle: response.message, icon: "error" } }));
				showSpinner(false);
			}
			const reviewsData: (Pick<Leads, "id" | "nombre" | "apellido" | "empresa" | "direccion" | "cp" | "ciudad" | "provincia" | "pais" | "telefono" | "email" | "celular" | "referencia">)[] = response.data;	
			setData(reviewsData);

		})();
		//eslint-disable-next-line
	}, [toggleReloadTable])

	useEffect(() => {
		if (!data) return;														//Retornamos al cargar el componente por primera vez, cuando data vale null

		tableData.data = structuredClone(data);									//Si se modifican los datos de la tabla tambien actualizamos "tableData"
		tableData.setData = setData;
		setSorting([{ id: 'id', desc: true }]);	

		(async() => {
			await waitAllImagesCharged();
			showSpinner(false);
			showElement(data.length > 0);										//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();
		//eslint-disable-next-line
	}, [data])

	const deleteNewsFunction = async (leadId: number, leadEmail: string) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "leads", rowID: leadId});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó el lead: ${leadEmail}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar el lead.", subtitle: "Intente nuevamente", icon: "error" } }));
		}
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteNews: (reviewId: number, authorName: string) => setModal2(
					{
						show: true,
						title: "Eliminación de lead",
						icon: "warning",
						subtitle: `Se eliminará el lead: ${authorName}. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteNewsFunction(reviewId, authorName),
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
		// debugTable: true,
	});

	const attachFile = () => {
		const fileInput = document.querySelector('.leadsListPage_file_input') as HTMLInputElement;
		fileInput.click();
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {													// Leer el archivo como ArrayBuffer
				const arrayBuffer = e.target?.result as ArrayBuffer;
				const workbook = XLSX.read(arrayBuffer, { type: "array" });				// Convertir el ArrayBuffer a un objeto Excel
				const sheetName = workbook.SheetNames[0];							    // Asumiendo que quieres trabajar con la primera hoja
				const sheet = workbook.Sheets[sheetName];
				const jsonData = XLSX.utils.sheet_to_json(sheet);						// Convertir la hoja a un objeto JSON
				console.log("Datos del Excel:", jsonData);
			};
			reader.readAsArrayBuffer(file);
		}
	};

	return (
		<PageWrapper name='Listado de leads' className='elementToShow'>
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
				<SubheaderRight>
					<Link to="/crm/lead/new">
						<Button variant='solid' icon='HeroPlus'>
							Añadir Lead
						</Button>
					</Link>
					<div>
						<Button variant='solid' color='emerald' icon='HeroPlus' onClick={attachFile}>
							Importar
						</Button>
						<input 
							type="file" 
							className='leadsListPage_file_input' 
							multiple={false} 
							accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={handleFileUpload}
						/>
					</div>
				</SubheaderRight>
			</Subheader>
			<Container className='w-full mx-0 min-w-full'>
				<Card className='h-full w-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Listado de leads potenciales</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} leads potenciales
							</Badge>
						</CardHeaderChild>
					</CardHeader>
					<CardBody className='overflow-auto'>
						<TableTemplate className='table-fixed max-md:min-w-[70rem] reviewsListTable' table={table} />
					</CardBody>
					<TableCardFooterTemplate table={table} />
				</Card>
			</Container>
		</PageWrapper>
	);
};

export default LeadsListPage;
