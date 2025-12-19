import React, { useEffect, useState, useContext, useRef } from 'react';
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
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Badge from '../../../components/ui/Badge';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/form/Input';
import Subheader, {
	SubheaderLeft,
} from '../../../components/layouts/Subheader/Subheader';
import FieldWrap from '../../../components/form/FieldWrap';
import { showModal1 } from '../../../features/modalSlice';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';
import { Habdeslog, Producto } from '../../../types/DASHBOARD/database';
import { getProductsByIDs, getTable } from '../../../services/database';
import { SpinnerContext } from '../../../context/spinnerContext';
import { showElement, timestampToDateAndHour, waitAllImagesCharged } from '../../../utils/utils';

const columnHelper = createColumnHelper <Habdeslog & {imgSrc: string, productName: string, codigo: string}> ();

const tableData: {data: (Habdeslog & {imgSrc: string, productName: string, codigo: string})[], setData: React.Dispatch<React.SetStateAction<(Habdeslog & {imgSrc: string, productName: string, codigo: string})[] | null>>} = {data: [], setData: () => {}};			//tableData recibe los datos de la tabla (data) y el setData para modificar la tabla desde afuera del componente funcional

let columns: any[];																		   					//Creamos una variable global que guarda los datos de columnas para acceder desde adentro del componente funcional

const getColumns = () => {	//Función para setear el valos de "columns" desde adentro del componente funcional
	columns = [
		columnHelper.accessor('codigo', {
			cell: (info) => <Link to={`/sales/product/${info.row.original.id_producto}`} target='_blank'><span className='underline text-blue-500'>{info.getValue()}</span></Link>,
			header: 'Código Producto',
			footer: 'Código Producto',
			id: "id"
		}),
		columnHelper.accessor('imgSrc', {
			cell: (info) => <img src={info.getValue()} alt="Product" className='w-20 h-20 object-cover'/>,
			header: 'Imagen',
			footer: 'Imagen',
			id: "imgSrc"
		}),
		columnHelper.accessor('productName', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Nombre',
			footer: 'Nombre',
			id: "productName"
		}),
		columnHelper.accessor('timestamp', {
			cell: (info) => <span>{timestampToDateAndHour(info.getValue())}</span>,
			header: 'Fecha',
			footer: 'Fecha',
			id: "timestamp"
		}),
		columnHelper.accessor('prevstate', {
			cell: (info) => <Badge
				color={info.getValue() === "1" ? "emerald" : "red"}
				variant='solid'
				className='py-1 min-w-36'
			>
				{info.getValue() === "1" ? "Habilitado" : "Deshabilitado"}
			</Badge>,
			header: 'Estado anterior',
			footer: 'Estado anterior',
			id: "prevstate"
		}),
		columnHelper.accessor('newstate', {
			cell: (info) => <Badge
				color={info.getValue() === "1" ? "emerald" : "red"}
				variant='solid'
				className='py-1 min-w-36'
			>
				{info.getValue() === "1" ? "Habilitado" : "Deshabilitado"}
			</Badge>,
			header: 'Estado actual',
			footer: 'Estado actual',
			id: "newstate"
		}),
	];
};

const SellersListPage = () => {

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<(Habdeslog & {imgSrc: string, productName: string, codigo: string})[] | null>(null);
	const {showSpinner} = useContext(SpinnerContext);
	const firstTime = useRef(true);  
	const dispatch = useDispatch();

	useEffect(() => {		
		showSpinner(true);								
				
		(async () => {
			const response1 = await getTable({ tableName: "habdeslog"});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de productos
			if (!response1.success || !response1.data) {
				dispatch(showModal1({ show: true, info: { title: "No se pudo renderizar la tabla", subtitle: response1.message, icon: "error" } }));
				showSpinner(false);
				return;
			}
			const productsSyncFromDB: Habdeslog[] = response1.data;

			const productsSyncIDs = productsSyncFromDB.map((product) => product.id_producto);
			const fields: (keyof Producto)[] = ["nombre", "foto1"];
			const response2 = await getProductsByIDs({iDsArr: productsSyncIDs, fieldsArr: fields});
			if (!response2.success || !response2.data) {
				dispatch(showModal1({ show: true, info: { title: "No se pudieron obtener los datos de productos", subtitle: response1.message, icon: "error" } }));
				showSpinner(false);
				return;
			}

			const productsSyncDataFromDB: Pick<Producto, "nombre" | "foto1" | "thumbnail1" | "id" | "codigo">[] = response2.data;

			const productsSyncWithAdditionalData = productsSyncFromDB.map((product) => {
				const productData =  productsSyncDataFromDB.find((prod) => prod.id === product.id_producto);
				return {
					...product,
					codigo: productData?.codigo || "",
					imgSrc: productData?.thumbnail1 || "",
					productName: productData?.nombre || "",
				};
			});
			setData(productsSyncWithAdditionalData);
		
		})();
		//eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!data) return;														//Retornamos al cargar el componente por primera vez, cuando data vale null

		tableData.data = structuredClone(data);									//Si se modifican los datos de la tabla tambien actualizamos "tableData"
		tableData.setData = setData;
		setSorting([{ id: 'timestamp', desc: true }]);	

		(async() => {
			await waitAllImagesCharged();
			showSpinner(false);
			showElement(data.length > 0);										//Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();
		//eslint-disable-next-line
	}, [data])

	if (firstTime.current) {																			//Función que setea por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false;																		// para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns();																					// (NO FUNCIONA CON UN USEEFECT YA QUE EL USEEFECT SE EJECUTA DESPUES DE SETEAR EL HTML)
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
				</Subheader>
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Logs de hab./des. automática</CardTitle>
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
