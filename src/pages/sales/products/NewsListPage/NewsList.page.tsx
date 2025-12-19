import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./newsList.page.css";
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
} from '../../../../components/layouts/Subheader/Subheader';
import FieldWrap from '../../../../components/form/FieldWrap';
import { showModal1 } from '../../../../features/modalSlice';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';
import { Novedad, Producto } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { showElement, waitAllImagesCharged } from '../../../../utils/utils';

const columnHelper = createColumnHelper <Novedad> ();

const tableData: {data: Partial<Novedad>[], setData: React.Dispatch<React.SetStateAction<Partial<Novedad>[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

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
		columnHelper.accessor('productoNombre', {
			cell: (info) => (
				<Link to={`/sales/product/${info.row.original.productoId}`} className='underline text-blue-500 capitalize'>{info.row.original.productoNombre.toLowerCase()}</Link>
			),
			header: 'Producto',
			footer: 'Producto',
			id: getIndex().toString()
		}),
		columnHelper.accessor('titulo', {
			cell: (info) => (
				<span className='capitalize'>{info.getValue().toLowerCase()}</span>
			),
			header: 'Título',
			footer: 'Título',
			id: getIndex().toString()
		}),
		columnHelper.accessor('carrousel', {
			cell: (info) => <span className='text-lg'>{info.getValue() === "1" ? "Si" : "No"}</span>,
			header: 'Mostrar en carrousel',
			footer: 'Mostrar en carrousel',
			id: getIndex().toString()
		}),
		columnHelper.accessor('habilitada', {
			cell: (info) => <span className='text-lg'>{info.getValue() === "1" ? "Si" : "No"}</span>,
			header: 'Habilitada',
			footer: 'Habilitada',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/sales/news/${info.getValue()}`}>
					<Tooltip text='Editar Novedad'>
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
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteNews(info.getValue(), info.row.original.titulo)}>
							<Tooltip text='Eliminar Novedad'>
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

const NewsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Partial<Novedad>[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
				
		const fieldsNewsList: Array<keyof Partial<Novedad>> = ["id", "titulo", "carrousel", "habilitada", "id_producto"];
		const fieldsProductsList: Array<keyof Partial<Producto>> = ["id", "nombre"];
		(async () => {
			
			const response1 = await getTable({ tableName: "novedad", fields: fieldsNewsList});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (response1.success && response1.data && response1.data.length) {
				const newsListData: Partial<Novedad>[] = response1.data;
				
				const response2 = await getTable({tableName: "producto", fields: fieldsProductsList});
				if (response2.success && response2.data && response2.data.length)  {
					const productsData: Partial<Producto>[] = response2.data;

					const newsListDataWithAditionalInfo: Partial<Novedad>[] = 
					newsListData.map((news) => 
						{	
							const productNews =  productsData.find((product) => product.id === news.id_producto);
							
							return{
								...news, 
								productoNombre: response2.success && productsData && productsData.length ? productNews?.nombre : "",
								productoId: productNews ? productNews.id : "",
							};
						}
					);			
					setData(newsListDataWithAditionalInfo);
				}
				 
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

	const deleteNewsFunction = async (newsId: number, newsTitle: string) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "novedad", rowID: newsId});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó la novedad: ${newsTitle}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar la novedad.", subtitle: "Intente nuevamente", icon: "error" } }));
		}
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteNews: (newsId: number, newsTitle: string) => setModal2(
					{
						show: true,
						title: "Eliminación de novedad",
						icon: "warning",
						subtitle: `Se eliminará la novedad: ${newsTitle}. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteNewsFunction(newsId, newsTitle),
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
		<PageWrapper name='Listado de novedades' className='elementToShow'>
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
							<CardTitle>Listado de novedades</CardTitle>
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

export default NewsListPage;
