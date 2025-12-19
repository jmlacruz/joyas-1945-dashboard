import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';

import Input from '../../../components/form/Input';
import Icon from '../../../components/icon/Icon';
import Subheader, { SubheaderLeft } from '../../../components/layouts/Subheader/Subheader';
import Badge from '../../../components/ui/Badge';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';

import FieldWrap from '../../../components/form/FieldWrap';
import { SpinnerContext } from '../../../context/spinnerContext';
import { getTable } from '../../../services/database';
import { Cart, CartItem, Producto, Usuario } from '../../../types/DASHBOARD/database';
import { timestampToDateAndHour } from '../../../utils/utils';

type InProcessOrdersData = {
	user: string;
	lastActionDate: number;
	articlesQty: number;
	total: number;
	lastActionHours: number;
};

const columnHelper = createColumnHelper<InProcessOrdersData>();

const tableData: {
	data: InProcessOrdersData[];
	setData: React.Dispatch<React.SetStateAction<InProcessOrdersData[] | null>>;
} = { data: [], setData: () => {} };

let columns: any[];

const getColumns = () => {
	columns = [
		columnHelper.accessor('user', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Usuario',
			footer: 'Usuario',
			id: 'id',
		}),
		columnHelper.accessor('lastActionDate', {
			cell: (info) => <span>{timestampToDateAndHour(info.getValue())}</span>,
			header: 'Ingreso',
			footer: 'Ingreso',
			id: 'lastActionDate',
		}),
		columnHelper.accessor('articlesQty', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Cant. de artículos',
			footer: 'Cant. de artículos',
			id: 'articlesQty',
		}),
		columnHelper.accessor('total', {
			cell: (info) => <span>${info.getValue()}</span>,
			header: 'Monto',
			footer: 'Monto',
			id: 'total',
		}),
		columnHelper.accessor('lastActionHours', {
			cell: (info) => <span>{info.getValue()} horas</span>,
			header: 'Última acción hace:',
			footer: 'Última acción hace:',
			id: 'lastActionHours',
		}),
	];
};

const InProcessOrdersListPage = () => {
	const firstTime = useRef(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');

	const [data, setData] = useState<InProcessOrdersData[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);

	if (firstTime.current) {
		//Función que sete por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false; // para que este valor sea constante. Sinó la tabla no ordena por columna
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
		// debugTable: true,
	});

	function parseCart(cart: string | undefined): any[] {
		try {
			return JSON.parse(cart || '[]');
		} catch {
			return [];
		}
	}

	useEffect(() => {
		showSpinner(true);

		(async () => {
			const response1 = await getTable({ tableName: 'carts' });
			const cartsData: Cart[] =
				response1.success && response1.data && response1.data.length ? response1.data : [];

			const usersFields: (keyof Usuario)[] = ['email', 'nombre', 'apellido'];
			const response2 = await getTable({ tableName: 'usuario', fields: usersFields });
			const usersData: Usuario[] =
				response2.success && response2.data && response2.data.length ? response2.data : [];

			const poductsFields: (keyof Producto)[] = ['precio', 'id'];
			const response3 = await getTable({ tableName: 'producto', fields: poductsFields });
			const productssData: Producto[] =
				response3.success && response3.data && response3.data.length ? response3.data : [];

			const cartsDataFiltered = cartsData.filter(
				(cartData) => parseCart(cartData?.cart).length > 0,
			);
			const ordersInProgressData = cartsDataFiltered?.map((cartData) => {
				const userData = usersData.find((ud) => ud.email === cartData.userEmail);
				const articlesDataParsed: CartItem[] = JSON.parse(cartData?.cart);
				const intemsQty = articlesDataParsed.reduce(
					(acc, article) => acc + article.quantity,
					0,
				);
				const total = articlesDataParsed.reduce(
					(acc, article) =>
						acc +
						(productssData.find((pd) => pd.id === article.itemId)?.precio || 0) *
							article.quantity,
					0,
				);
				const lastActionHours = Math.floor(
					(Date.now() - cartData.lastDate) / (1000 * 60 * 60),
				);
				return {
					user: `${userData?.nombre} ${userData?.apellido}`,
					lastActionDate: cartData.lastDate,
					articlesQty: intemsQty,
					total,
					lastActionHours,
				};
			});
			setData(ordersInProgressData);
		})();
	}, [showSpinner]);

	useEffect(() => {
		if (!data) return;

		tableData.data = structuredClone(data);
		tableData.setData = setData;
		setSorting([{ id: 'id', desc: true }]); //Una vez recibidos los datos de la tabla se ordena por id en forma descendente
		showSpinner(false);
	}, [data, showSpinner]);

	return (
		<PageWrapper name='Listado de pedidos' className='ordersListPageContainer'>
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
							<CardTitle>Listado de Pedidos en proceso</CardTitle>
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

export default InProcessOrdersListPage;
