import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./reviewsList.page.css";
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
import { Reviews } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable, updateGoogleReviews } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { getDateFromDateNow, showElement, waitAllImagesCharged } from '../../../../utils/utils';
import Button from '../../../../components/ui/Button';

const columnHelper = createColumnHelper <Reviews> ();

const tableData: {data: Partial<Reviews>[], setData: React.Dispatch<React.SetStateAction<Partial<Reviews>[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

let columns: any[];																		   					//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningFordeleteNews: (reviewId: number, authorName: string) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor('author_name', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Nombre del cliente',
			footer: 'Nombre del cliente',
			id: 'author_name'
		}),
		columnHelper.accessor('rating', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Calificación',
			footer: 'Calificación',
			id: 'rating'
		}),
		columnHelper.accessor('text', {
			cell: (info) => <span>{info.getValue().length > 200 ? info.getValue().substring(0, 200) + "...": info.getValue()}</span>,
			header: 'Reseña',
			footer: 'Reseña',
			id: 'text'
		}),
		columnHelper.accessor('time', {
			cell: (info) => <span>{getDateFromDateNow(info.getValue())}</span>,
			header: 'Fecha',
			footer: 'Fecha',
			id: 'time'
		}),
		columnHelper.accessor('show', {
			cell: (info) => <span>{info.getValue() === "1" ? "Si" : "No"}</span>,
			header: 'Mostrar en sitio',
			footer: 'Mostrar en sitio',
			id: 'show'
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/crm/review/${info.getValue()}`}>
					<Tooltip text='Editar Novedad'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>,
			header: 'Editar',
			footer: 'Editar',
			enableSorting: false,
			id: 'id2'
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				{
					return (
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteNews(info.getValue(), info.row.original.author_name)}>
							<Tooltip text='Eliminar Novedad'>
								<Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed' />
							</Tooltip>
						</div>
					);
				},
			header: 'Eliminar',
			footer: 'Eliminar',
			enableSorting: false,
			id: 'id3'
		}),
	];
};

const ReviewsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Partial<Reviews>[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
					
		(async () => {

			const response0 = await updateGoogleReviews();
			if (!response0.success) {
				dispatch(showModal1({ show: true, info: { title: "No se pudo acceder a las reviews de Google", subtitle: response0.message, icon: "error" } }));
				showSpinner(false);
			}

			const fields: (keyof Reviews)[] = ["id", "author_name", "rating", "text", "time", "show"];
			const response = await getTable({ tableName: "reviews", fields});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (!response.success || !response.data || !response.data.length) {
				dispatch(showModal1({ show: true, info: { title: "No se pudo renderizar la tabla", subtitle: response.message, icon: "error" } }));
				showSpinner(false);
			}
			const reviewsData: (Pick<Reviews, "id" | "author_name" | "rating" | "text" | "time" | "show">)[] = response.data;	
			setData(reviewsData);

		})();
		//eslint-disable-next-line
	}, [toggleReloadTable])

	useEffect(() => {
		if (!data) return;														//Retornamos al cargar el componente por primera vez, cuando data vale null

		tableData.data = structuredClone(data);									//Si se modifican los datos de la tabla tambien actualizamos "tableData"
		tableData.setData = setData;
		setSorting([{ id: 'time', desc: true }]);	

		(async() => {
			await waitAllImagesCharged();
			showSpinner(false);
			showElement(data.length > 0);										//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();
		//eslint-disable-next-line
	}, [data])

	const deleteNewsFunction = async (reviewId: number, authorName: string) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "reviews", rowID: reviewId});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó la reseña de: ${authorName}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar la reseña.", subtitle: "Intente nuevamente", icon: "error" } }));
		}
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteNews: (reviewId: number, authorName: string) => setModal2(
					{
						show: true,
						title: "Eliminación de reseña",
						icon: "warning",
						subtitle: `Se eliminará la reseña de: ${authorName}. Desea continuar?`,
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
					<Button variant='solid' icon='HeroArrowPath' color='blue' onClick={() => setToggleReloadTable((current) => !current)} className='productsList_filter_search_button mr-4'>
						Actualizar Reseñas
					</Button>
				</SubheaderLeft>
			</Subheader>
			<Container>
				<Card className='h-full'> 
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Listado de reseñas</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} reseñas
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

export default ReviewsListPage;
