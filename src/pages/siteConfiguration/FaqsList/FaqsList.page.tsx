import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./faqsList.page.css";
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
import Tooltip from '../../../components/ui/Tooltip';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Badge from '../../../components/ui/Badge';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/form/Input';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '../../../components/layouts/Subheader/Subheader';
import FieldWrap from '../../../components/form/FieldWrap';
import { showModal1 } from '../../../features/modalSlice';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';
import { Faqs, Faqs_answer } from '../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../services/database';
import { SpinnerContext } from '../../../context/spinnerContext';
import { Modal2Context } from '../../../context/modal2Context';
import { getFilenameFromFirebaseUrl, showElement, waitAllImagesCharged } from '../../../utils/utils';
import { deleteFiles } from '../../../services/firebase';

const columnHelper = createColumnHelper <Faqs> ();

const tableData: {data: Faqs[], setData: React.Dispatch<React.SetStateAction<Faqs[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

let columns: any[];																		   			//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningForDeleteFaq: (faqID: number) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => (
				<span>{info.getValue()}</span>
			),
			header: 'ID',
			footer: 'ID',
			id: "id"
		}),
		columnHelper.accessor('order', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Orden',
			footer: 'Orden',
			id: "order"
		}),
		columnHelper.accessor('question', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Pregunta',
			footer: 'Pregunta',
			id: "question"
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/siteConfiguration/faqEdit/${info.getValue()}`}>
					<Tooltip text='Editar método de envío'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>,
			header: 'Editar',
			footer: 'Editar',
			enableSorting: false,
			id: "id2"
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				{
					return (
						<div className='dflex wh100 justify-start' onClick={() => options.warningForDeleteFaq(info.getValue())}>
							<Tooltip text='Eliminar método de envío'>
								<Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed' />
							</Tooltip>
						</div>
					);
				},
			header: 'Eliminar',
			footer: 'Eliminar',
			enableSorting: false,
			id: "id3"
		}),
	];
};

const FaqsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Faqs[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
				
		const shippingMethodsListFields: Array<keyof Faqs> = ["id", "order", "question"];
		(async () => {
			
			const response1 = await getTable({ tableName: "faqs", fields: shippingMethodsListFields});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (response1.success && response1.data && response1.data.length) {
				const shippingMethodsListData: Faqs[] = response1.data;
				setData(shippingMethodsListData);
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

	const deleteFaqFunction = async (faqID: number) => {
		showSpinner(true);
		const response1 = await deleteRowByID({tableName: "faqs", rowID: faqID});
		if (!response1.success || !response1.data) {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar la pregunta", subtitle: "Intente nuevamente", icon: "error" } }));
			showSpinner(false);
			return;
		}

		const response2 = await getTable({tableName: "faqs_answer", conditions: [{field: "id_faqs", value: faqID}]});
		if (!response2.success || !response2.data || !response2.data.length) {
			dispatch(showModal1({ show: true, info: { title: "No se pudo obtener la lista de respuestas a eliminar", subtitle: "Intente nuevamente", icon: "error" } }));
			showSpinner(false);
			return;
		}
		const faqAnswersData: Faqs_answer[] = response2.data;
		const faqAnswersIDToRemove = faqAnswersData.map((faqAnswer) => faqAnswer.id);

		const faqAnswersFilesToRemove: string[] = [];
		faqAnswersData.forEach((faqAnswer) => {
			if (faqAnswer.value.includes("firebasestorage.googleapis.com")) faqAnswersFilesToRemove.push(getFilenameFromFirebaseUrl(faqAnswer.value));
		});
		
		const promises3 = faqAnswersFilesToRemove.map((filename) => deleteFiles(filename));
		const responses3 = await Promise.all(promises3);
		if (responses3.some((resp) => !resp.success)) {
			dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "No se pudieron eliminar las imágenes"}}));
			showSpinner(false);
			return;
		}

		const promises4 = faqAnswersIDToRemove.map((faqsAnswerID) => deleteRowByID({tableName: "faqs_answer", rowID: faqsAnswerID}));
		const responses4 = await Promise.all(promises4);
		if (responses4.some((resp) => !resp.success)) {
			dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "No se pudieron eliminar las respuestas"}}));
			showSpinner(false);
			return;
		}

		dispatch(showModal1({show: true, info: {icon: "success", title: "Acción completada", subtitle: "Elemento eliminado correctamente"}}));
		setToggleReloadTable((current) => !current);
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningForDeleteFaq: (faqID: number) => setModal2(
					{
						show: true,
						title: "Eliminación de pregunta",
						icon: "warning",
						subtitle: `Se eliminará la pregunta. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteFaqFunction(faqID),
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
		<PageWrapper name='Lista de "Como funciona"' className='elementToShow'>
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
					<Link to="/siteConfiguration/newFaq">
						<Button variant='solid' icon='HeroPlus'>
							Agregar "Como funciona"
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
									<CardTitle>Listado de "Como funciona"</CardTitle>
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
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default FaqsListPage;
