import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./clothsList.page.css";
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
import Button from '../../../../components/ui/Button';
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
import { Pano } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { showElement, waitAllImagesCharged } from '../../../../utils/utils';

const columnHelper = createColumnHelper <Pano> ();

const tableData: {data: Pano[], setData: React.Dispatch<React.SetStateAction<Pano[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

const index = {value: 0};																			//Lógica para dar valores únicos a los ids de las columnas
const getIndex = () => {
	index.value += 1;
	return index.value;
};

let columns: any[];																		   			//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningFordeleteCloth: (clothId: number, clothName: string) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => (
				<span>{info.getValue()}</span>
			),
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor('nombre', {
			cell: (info) => <Link to={`/sales/product/list?panoID=${info.row.original.id}`} className='underline text-blue-500'>{info.getValue()}</Link>,
			header: 'Nombre',
			footer: 'Nombre',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/sales/cloth/${info.getValue()}`}>
					<Tooltip text='Editar paño'>
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
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteCloth(info.getValue(), info.row.original.nombre)}>
							<Tooltip text='Eliminar paño'>
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

const ClothsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Pano[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
				
		const fieldsClothList: Array<keyof Pano> = ["id", "nombre"];
		(async () => {
			
			const response1 = await getTable({ tableName: "pano", fields: fieldsClothList});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (response1.success && response1.data && response1.data.length) {
				const clothsListData: Pano[] = response1.data;
				setData(clothsListData);
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

		(async() => {
			await waitAllImagesCharged();
			setSorting([{ id: 'id', desc: true }]);	
			showSpinner(false);
			showElement(data.length > 0);										//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();
		//eslint-disable-next-line
	}, [data])

	const deleteClothFunction = async (clothId: number, clothName: string) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "pano", rowID: clothId});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó el paño: ${clothName}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: `No se pudo eliminar el paño: ${response1.message}`, subtitle: "Intente nuevamente", icon: "error" } }));
		}
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteCloth: (pricesGroupId: number, pricesGroupName: string) => setModal2(
					{
						show: true,
						title: "Eliminación de paño",
						icon: "warning",
						subtitle: `Se eliminará el paño: ${pricesGroupName}. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteClothFunction(pricesGroupId, pricesGroupName),
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
		<PageWrapper name='Lista de paños' className='elementToShow'>
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
					<Link to="/sales/newCloth">
						<Button variant='solid' icon='HeroPlus'>
							Agregar paño
						</Button>
					</Link>
				</SubheaderRight>
			</Subheader>
			<Container>
				<div className='grid grid-cols-12'>
					<div className='col-span-12 lg:col-span-9'>
						<Card>
							<CardHeader>
								<CardHeaderChild>
									<CardTitle>Listado de paños</CardTitle>
									<Badge
										variant='outline'
										className='border-transparent px-4'
										rounded='rounded-full'>
										{table.getFilteredRowModel().rows.length} items
									</Badge>
								</CardHeaderChild>
							</CardHeader>
							<CardBody className='overflow-auto'>
								<TableTemplate className='table-fixed max-md:min-w-[70rem] clothsListTable' table={table} />
							</CardBody>
							<TableCardFooterTemplate table={table} />
						</Card>
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default ClothsListPage;
