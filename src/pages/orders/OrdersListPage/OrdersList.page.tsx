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
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import { showModal1 } from '../../../features/modalSlice';

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
import Tooltip from '../../../components/ui/Tooltip';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';

import FieldWrap from '../../../components/form/FieldWrap';
import { Modal2Context } from '../../../context/modal2Context';
import { SpinnerContext } from '../../../context/spinnerContext';
import { deleteRowByID, deleteRows, getProductsByIDs, getTable } from '../../../services/database';
import { PaymentOptions } from '../../../types/DASHBOARD';
import {
	PaymentMethods,
	Pedidos,
	PedidosParsed,
	Producto,
	Usuario,
	Vendedor,
} from '../../../types/DASHBOARD/database';
import { formatDateStringWithBars } from '../../../utils/utils';
import './ordersList.page.css';

const columnHelper = createColumnHelper<PedidosParsed>();

const tableData: {
	data: PedidosParsed[];
	setData: React.Dispatch<React.SetStateAction<PedidosParsed[] | null>>;
} = { data: [], setData: () => {} };

let columns: any[];

const getPaymentMethod = (paymentCode: PaymentMethods): PaymentOptions => {
	switch (paymentCode) {
		case 'P':
			return 'Lo resuelvo personalmente';
		case 'TDC':
			return 'Transferencia o depósito bancario';
		default:
			return '';
	}
};

const getColumns = (options: { deleteOrderFunction: (orderId: number) => void }) => {
	columns = [
		columnHelper.accessor('id', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'ID',
			footer: 'ID',
			id: 'id',
		}),
		columnHelper.accessor('fecha', {
			cell: (info) => <span>{formatDateStringWithBars(info.getValue())}</span>,
			header: 'Fecha',
			footer: 'Fecha',
			id: 'fecha',
		}),
		columnHelper.accessor('userCompleteName', {
			cell: (info) => (
				<Link to={`/crm/customer/${info.row.original.usuario}`}>
					<span
						style={{ textTransform: 'capitalize' }}
						className='text-blue-500 underline'>
						{info.getValue().toLowerCase()}
					</span>
				</Link>
			),
			header: 'Usuario',
			footer: 'Usuario',
			id: 'userCompleteName',
		}),
		columnHelper.accessor('paymentMethod', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Forma de pago',
			footer: 'Forma de pago',
			id: 'paymentMethod',
		}),
		columnHelper.accessor('sellerName', {
			cell: (info) => <span style={{ textTransform: 'capitalize' }}>{info.getValue()}</span>,
			header: 'Vendedor',
			footer: 'Vendedor',
			id: 'sellerName',
		}),
		columnHelper.accessor('id', {
			cell: (info) => (
				<Link
					className='dflex wh100 w-10 min-w-10 justify-start'
					to={`/order/view/${info.getValue()}/print`}>
					<Tooltip text='Imprimir Pedido'>
						<Icon icon='HeroPrinter' color='amber' size='text-3xl' />
					</Tooltip>
					<span className='printedqty mb-0 ml-1'>
						{info.row.original.printedqty || ''}
					</span>
				</Link>
			),
			header: '',
			footer: '',
			enableSorting: false,
			id: 'id1',
		}),
		columnHelper.accessor('id', {
			cell: (info) => (
				<Link className='dflex wh100' to={`/order/edit/${info.getValue()}`}>
					<Tooltip text='Modificar Pedido'>
						<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
					</Tooltip>
				</Link>
			),
			header: '',
			footer: '',
			enableSorting: false,
			id: 'id2',
		}),
		columnHelper.accessor('id', {
			cell: (info) => (
				<Link className='dflex wh100' to={`/order/view/${info.getValue()}`}>
					<Tooltip text='Ver Pedido'>
						<Icon icon='HeroEye' color='emerald' size='text-3xl' />
					</Tooltip>
				</Link>
			),
			header: '',
			footer: '',
			enableSorting: false,
			id: 'id3',
		}),
		columnHelper.accessor('id', {
			cell: (info) => (
				<div
					className='dflex wh100'
					onClick={() => options.deleteOrderFunction(info.row.original.id)}>
					<Tooltip text='Eliminar Pedido'>
						<Icon
							icon='HeroTrash'
							color='red'
							size='text-3xl'
							className='trashIconRed'
						/>
					</Tooltip>
				</div>
			),
			header: '',
			footer: '',
			enableSorting: false,
			id: 'id4',
		}),
	];
};

const OrdersListPage = () => {
	const firstTime = useRef(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [toggleReloadTable, setToggleReloadTable] = useState(true);

	const [data, setData] = useState<PedidosParsed[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);
	const { setModal2 } = useContext(Modal2Context);
	const dispatch = useDispatch();

	const deleteOrderFunc = async (options: { orderID: number }) => {
		showSpinner(true);

		const response = await deleteRowByID({ tableName: 'pedidos', rowID: options.orderID });
		if (response.success && response.data >= 1) {
			//La base de datos devuelve el número de filas eliminadas
			const response2 = await deleteRows({
				tableName: 'detalle',
				conditions: [{ field: 'id_pedido', value: options.orderID }],
			});
			if (!response2.data || !response.success) {
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'No se pudieron eliminar los datos de productos del pedido',
							subtitle: response2.message,
							icon: 'error',
						},
					}),
				);
				showSpinner(false);
				return;
			}
			setToggleReloadTable((current) => !current);
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Acción completada',
						subtitle: `Se eliminó el pedido con ID ${options.orderID}`,
						icon: 'success',
					},
				}),
			);
		} else if (response.success && response.data === 0) {
			//Si no se eliminó ninguna fila la base devuelve 0
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'No se pudo eliminar el pedido',
						subtitle: 'Intente nuevamente',
						icon: 'error',
					},
				}),
			);
			showSpinner(false);
		} else {
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'No se pudo eliminar el pedido. Intente nuevamente',
						subtitle: response.message,
						icon: 'error',
					},
				}),
			);
			showSpinner(false);
		}
	};

	if (firstTime.current) {
		//Función que sete por única ves la variable "columns" con el valor de la tabla
		firstTime.current = false; // para que este valor sea constante. Sinó la tabla no ordena por columna
		getColumns({
			deleteOrderFunction: (orderID: number) =>
				setModal2({
					show: true,
					title: 'Eliminación de pedido',
					icon: 'warning',
					subtitle: `Se eliminará el pedido con ID: ${orderID}. Desea continuar?`,
					firstButtonText: 'Cancelar',
					secondButtonText: 'Confirmar',
					firstButtonFunction: () => setModal2({ show: false }),
					secondButtonFunction: () => deleteOrderFunc({ orderID }),
				}),
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

	useEffect(() => {
		//Leemos la base de datos
		showSpinner(true);

		(async () => {
			const sellerFields: (keyof Vendedor)[] = ['codigo', 'nombre', 'id'];
			const response1 = await getTable({
				tableName: 'vendedor',
				fields: sellerFields,
			}); //Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de pedidos
			const sellersData: Vendedor[] =
				response1.success && response1.data && response1.data.length ? response1.data : [];

			const usersFields: (keyof Usuario)[] = ['id', 'nombre', 'apellido'];
			const response2 = await getTable({
				tableName: 'usuario',
				fields: usersFields,
			});
			const usersData: Usuario[] =
				response2.success && response2.data && response2.data.length ? response2.data : [];

			const fieldsOrdersList: (keyof PedidosParsed)[] = [
				'id',
				'fecha',
				'estado',
				'pago_forma',
				'usuario',
				'vendedor',
				'printedqty',
			];
			const response3 = await getTable({
				tableName: 'pedidos',
				fields: fieldsOrdersList,
			});

			if (response3.success && response3.data && response3.data.length) {
				const ordersData: Pedidos[] = response3.data;

				const ordersDataFiltered = ordersData.filter((order) =>
					usersData.find((user) => user.id === order.usuario),
				); //Eliminamos los pedidos cuyos usuarios ya no están en la base de datos

				const ordersDataParsed: PedidosParsed[] = await Promise.all(
					ordersDataFiltered.map(async (order) => {
						//Parseamos el objeto que viene de la base de datos agregando los campos "sellerName", "userCompleteName" y "paymentMethod"
						const sellerFound = sellersData.find(
							(seller) =>
								seller.codigo ===
								(typeof order.vendedor === 'number'
									? order.vendedor.toString()
									: -1),
						);

						const userFound = usersData.find((user) => user.id === order.usuario);
						return {
							...order,
							sellerName: sellerFound ? sellerFound.nombre : '',
							userCompleteName: userFound
								? `${userFound.nombre} ${userFound.apellido}`
								: '',
							paymentMethod: getPaymentMethod(order.pago_forma),
						};
					}),
				);

				setData(ordersDataParsed);
			} else {
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'Error al renderizar la tabla',
							subtitle: response3.message,
							icon: 'error',
						},
					}),
				);
				showSpinner(false);
			}
		})();
	}, [toggleReloadTable]);

	useEffect(() => {
		if (!data) return;

		tableData.data = structuredClone(data);
		tableData.setData = setData;
		setSorting([{ id: 'id', desc: true }]); //Una vez recibidos los datos de la tabla se ordena por id en forma descendente
		showSpinner(false);
	}, [data]);

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
							<CardTitle>Listado de Pedidos</CardTitle>
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

export default OrdersListPage;
