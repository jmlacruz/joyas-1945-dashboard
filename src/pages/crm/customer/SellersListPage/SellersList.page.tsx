import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./sellersList.page.css";
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
import { Vendedor } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { showElement, waitAllImagesCharged } from '../../../../utils/utils';
import Button from '../../../../components/ui/Button';

const columnHelper = createColumnHelper <Vendedor> ();

const tableData: {data: Partial<Vendedor>[], setData: React.Dispatch<React.SetStateAction<Partial<Vendedor>[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

const index = {value: 0};																					//Lógica para dar valores únicos a los ids de las columnas
const getIndex = () => {
	index.value += 1;
	return index.value;
};

let columns: any[];																		   					//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningFordeleteNews: (newsId: number, newsTitle: string) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor('email', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Email',
			footer: 'Email',
			id: getIndex().toString()
		}),
		columnHelper.accessor('nombre', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Nombre',
			footer: 'Nombre',
			id: getIndex().toString()
		}),
		columnHelper.accessor('codigo', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Código',
			footer: 'Código',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/crm/seller/${info.getValue()}`}>
					<Tooltip text='Editar vendedor'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>,
			header: 'Editar',
			footer: 'Editar',
			enableSorting: false,
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				{
					return (
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteNews(info.getValue(), info.row.original.nombre)}>
							<Tooltip text='Eliminar vendedor'>
								<Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed' />
							</Tooltip>
						</div>
					);
				},
			header: 'Eliminar',
			footer: 'Eliminar',
			enableSorting: false,
			id: getIndex().toString()
		}),
	];
};

const SellersListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Partial<Vendedor>[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
				
		const fieldsSellersList: Array<keyof Partial<Vendedor>> = ["id", "email", "nombre", "codigo"];
		(async () => {
			
			const response1 = await getTable({ tableName: "vendedor", fields: fieldsSellersList});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (response1.success && response1.data && response1.data.length) {
				const sellersListData: Pick<Vendedor, "id" | "email" | "nombre" | "codigo">[] = response1.data;
				setData(sellersListData);
								 
			} else {
				dispatch(showModal1({ show: true, info: { title: "No se pudo renderizar la tabla", subtitle: response1.message, icon: "error" } }));
				showSpinner(false);
			}
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

	const deleteSellerFunction = async (sellerID: number, sellerName: string) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "vendedor", rowID: sellerID});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó el vendedor: ${sellerName}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar el vendedor.", subtitle: "Intente nuevamente", icon: "error" } }));
		}
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteNews: (sellerID: number, sellerName: string) => setModal2(
					{
						show: true,
						title: "Eliminación de vendedor",
						icon: "warning",
						subtitle: `Se eliminará el vendedor: ${sellerName}. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteSellerFunction(sellerID, sellerName),
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
			pagination: { pageSize: 10 },
		},
		// debugTable: true,
	});

	return (
		<PageWrapper name='Listado de vendedores' className='elementToShow'>
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
					<Link to="/crm/seller/new">
						<Button variant='solid' icon='HeroPlus'>
							Añadir vendedor
						</Button>
					</Link>
				</SubheaderRight>
			</Subheader>
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Listado de vendedores</CardTitle>
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

export default SellersListPage;
