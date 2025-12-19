import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import "./brandsList.page.css";
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
import { Marca } from '../../../../types/DASHBOARD/database';
import { deleteRowByID, getTable } from '../../../../services/database';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { Modal2Context } from '../../../../context/modal2Context';
import { showElement, waitAllImagesCharged } from '../../../../utils/utils';
import { deleteDocument, deleteFiles } from '../../../../services/firebase';

const columnHelper = createColumnHelper <Marca> ();

const tableData: {data: Marca[], setData: React.Dispatch<React.SetStateAction<Marca[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

const index = {value: 0};																													//Lógica para dar valores únicos a los ids de las columnas
const getIndex = () => {
	index.value += 1;
	return index.value;
};

let columns: any[];																		   													//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = (options: { warningFordeleteBrand: (pricesGroupId: number, pricesGroupName: string, imagesNamesToDeleteArr: string[], documentsNamesToDeleteArr: string[]) => void }) => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: getIndex().toString()
		}),
		columnHelper.accessor('orden', {
			cell: (info) => (
				<span>{info.getValue()}</span>
			),
			header: 'Orden',
			footer: 'Orden',
			id: getIndex().toString()
		}),
		columnHelper.accessor('descripcion', {
			cell: (info) => <span className='text-lg'>{info.getValue()}</span>,
			header: 'Descripción',
			footer: 'Descripción',
			id: getIndex().toString()
		}),
		columnHelper.accessor('link', {
			cell: (info) => <span className='text-lg'>{info.getValue()}</span>,
			header: 'Link',
			footer: 'Link',
			id: getIndex().toString()
		}),
		columnHelper.accessor('estado', {
			cell: (info) => <span className='text-lg'>{info.getValue()}</span>,
			header: 'Estado',
			footer: 'Estado',
			id: getIndex().toString()
		}),
		columnHelper.accessor('id', {
			cell: (info) =>
				<Link className='dflex wh100 justify-start' to={`/sales/brand/${info.getValue()}`}>
					<Tooltip text='Editar Marca'>
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
					const imagesNamesToDeleteArr: string[] = [];
					const documentsNamesToDeleteArr: string[] = [];
					if (info.row.original.imagenNameToDelete) imagesNamesToDeleteArr.push(info.row.original.imagenNameToDelete);
					if (info.row.original.logoNameToDelete) imagesNamesToDeleteArr.push(info.row.original.logoNameToDelete);
					if (info.row.original.pdfNameToDelete) documentsNamesToDeleteArr.push(info.row.original.pdfNameToDelete);
					if (info.row.original.pdfRecomendadoNameToDelete) documentsNamesToDeleteArr.push(info.row.original.pdfRecomendadoNameToDelete);
					return (
						<div className='dflex wh100 justify-start' onClick={() => options.warningFordeleteBrand(info.getValue(), info.row.original.descripcion, imagesNamesToDeleteArr, documentsNamesToDeleteArr)}>
							<Tooltip text='Eliminar Marca'>
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

const BrandsListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<Marca[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();
	const [toggleReloadTable, setToggleReloadTable] = useState(true);
	const {setModal2} = useContext(Modal2Context);

	useEffect(() => {		
		showSpinner(true);								
				
		const fieldsBrandsListRequired: Array<keyof Marca> = ["id", "orden", "descripcion", "link", "estado", "imagen", "logo", "pdf", "pdf_recomendado"];
		(async () => {
			
			const response1 = await getTable({ tableName: "marca", fields: fieldsBrandsListRequired});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			const brandsListData: Marca[] = response1.data;
			if (response1.success && response1.data && response1.data.length) {
				setData(brandsListData);
				 
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
			showSpinner(false);
			showElement(data.length > 0);										//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();
		//eslint-disable-next-line
	}, [data])

	const deleteBrandFunction = async (brandId: number, brandName: string, imagesNamesToDeleteArr: string[], documentsNamesToDeleteArr: string[]) => {
		showSpinner(true);

		if (imagesNamesToDeleteArr.length) {
			const promises = imagesNamesToDeleteArr.map(async (name) => {
				const response = await deleteFiles(name);
				if (!response.success) {
					throw new Error(response.message);
				}
				return response;
			});
			try {
				await Promise.all(promises);
			} catch (err) {
				err instanceof Error ?
					dispatch(showModal1({ show: true, info: { title: "No se pudieron eliminar las imágenes del bucket", subtitle: err.message, icon: "error" } })) :
					dispatch(showModal1({ show: true, info: { title: "No se pudieron eliminar las imágenes del bucket", subtitle: "Error desconocido", icon: "error" } }));
				showSpinner(false);
				return;
			}
		}

		if (documentsNamesToDeleteArr.length) {
			const promises = documentsNamesToDeleteArr.map(async (name) => {
				const response = await deleteDocument(name);
				if (!response.success) {
					throw new Error(response.message);
				}
				return response;
			});
			try {
				await Promise.all(promises);
			} catch (err) {
				err instanceof Error ?
					dispatch(showModal1({ show: true, info: { title: "No se pudieron eliminar los documentos del bucket", subtitle: err.message, icon: "error" } })) :
					dispatch(showModal1({ show: true, info: { title: "No se pudieron eliminar los documentos del bucket", subtitle: "Error desconocido", icon: "error" } }));
				showSpinner(false);
				return;
			}
		}

		const response1 = await deleteRowByID({tableName: "marca", rowID: brandId});
		if (response1.success) {
			setToggleReloadTable((current) => !current);
			dispatch(showModal1({ show: true, info: { title: "Acción completada", subtitle: `Se eliminó la marca: ${brandName}`, icon: "success" } }));
		} else {
			dispatch(showModal1({ show: true, info: { title: "No se pudo eliminar la marca.", subtitle: "Intente nuevamente", icon: "error" } }));
		}
		showSpinner(false);
	};

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns(																						// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
			{
				warningFordeleteBrand: (brandId: number, brandName: string, imagesNamesToDeleteArr: string[], documentsNamesToDeleteArr: string[]) => setModal2(
					{
						show: true,
						title: "Eliminación de marca",
						icon: "warning",
						subtitle: `Se eliminará la marca: ${brandName}. Desea continuar?`,
						firstButtonText: "Cancelar",
						secondButtonText: "Confirmar",
						firstButtonFunction: () => setModal2({ show: false }),
						secondButtonFunction: () => deleteBrandFunction(brandId, brandName, imagesNamesToDeleteArr, documentsNamesToDeleteArr),
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
		<PageWrapper name='Products List' className='elementToShow'>
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
					<Link to="/sales/newBrand">
						<Button variant='solid' icon='HeroPlus'>
							Agregar marca
						</Button>
					</Link>
				</SubheaderRight>
			</Subheader>
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Listado de marcas</CardTitle>
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

export default BrandsListPage;
