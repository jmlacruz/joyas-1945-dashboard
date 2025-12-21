import {
	CellContext,
	ColumnDef,
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import WaitImages from '../../../components/DASHBOARD/waitImages/WaitImages';
import FieldWrap from '../../../components/form/FieldWrap';
import Input from '../../../components/form/Input';
import Icon from '../../../components/icon/Icon';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, { SubheaderLeft } from '../../../components/layouts/Subheader/Subheader';
import Badge from '../../../components/ui/Badge';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import { SpinnerContext } from '../../../context/spinnerContext';
import { StreamChatContext } from '../../../context/streamChatContext';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../templates/common/TableParts.template';
import { QuerysDataParsed, StreamChatMessageType, UsersActivity } from '../../../types/DASHBOARD';
import priceFormat from '../../../utils/priceFormat.util';
import {
	filterStreamMessages,
	getStreamMessages,
	showElement,
	timestampToDateAndHour,
	waitAllImagesCharged,
} from '../../../utils/utils';
import './usersActivity.page.css';

const columnHelper = createColumnHelper<UsersActivity>();
const timeForSearchUsersActivity = 2; //en minutos (Solo se busca actividad de usuarios en esos ultimos minutos indicados)

const UsersActivityPage = () => {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [data, setData] = useState<UsersActivity[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);
	const { streamChat } = useContext(StreamChatContext);

	useEffect(() => {
		if (!streamChat.channel) {
			// Si no hay canal, establecemos data vacío para que el segundo useEffect oculte el spinner
			setData([]);
			return;
		}

		showSpinner(true);

		const checkStreamMessages = async () => {
			const messages = await getStreamMessages(streamChat.channel, 2);
			const messagesFiltered = filterStreamMessages(messages || []);
			setData(messagesFiltered);
			setTimeout(checkStreamMessages, (timeForSearchUsersActivity + 0.1) * 60 * 1000); //Para que si no hay actividad en los ultimos minutos indicados la tabla se limpie
		};
		checkStreamMessages();

		streamChat.channel.on('message.new', async (event) => {
			//Creamos un evento para detectar nuevos mensajes
			if (!event.message || !event.message.text) return;

			const messages = await getStreamMessages(
				streamChat.channel,
				timeForSearchUsersActivity,
			);
			const messagesFiltered = filterStreamMessages(messages || []);
			setData(messagesFiltered);

			showSpinner(false);
		});

		//eslint-disable-next-line
	}, [streamChat.channel]);

	useEffect(() => {
		if (!data) return;

		(async () => {
			await waitAllImagesCharged();
			showSpinner(false);
			showElement(data.length >= 0); //Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos
		})();

		//eslint-disable-next-line
	}, [data]);

	const getActivityData = (
		activityType: StreamChatMessageType,
		info: CellContext<UsersActivity, any>,
	) => {
		switch (activityType) {
			case 'buy':
				return (
					<>
						<WaitImages className='w-fit'>
							<img
								src={info.getValue()}
								alt={info.row.original.itemDescription}
								className='mr-2 w-24 min-w-24 max-w-24 object-contain'
							/>
						</WaitImages>
						<p className='max-w-xl'>{info.row.original.itemDescription}</p>
					</>
				);
			case 'enter':
				return (
					<p className='max-w-xl'>
						{info.row.original.userCity
							? `Ubicación: ${info.row.original.userCity}`
							: ''}
					</p>
				);
			case 'out':
				return (
					<p className='max-w-xl'>
						{info.row.original.userCity
							? `Ubicación: ${info.row.original.userCity}`
							: ''}
					</p>
				);
			case 'purchase':
				return (
					<p className='max-w-xl'>{`Total: $${priceFormat(info.row.original.total)}`}</p>
				);
			case 'showProduct':
				return (
					<>
						<WaitImages className='w-fit'>
							<img
								src={info.getValue()}
								alt={info.row.original.itemDescription}
								className='mr-2 w-24 min-w-24 max-w-24 object-contain'
							/>
						</WaitImages>
						<p className='max-w-xl'>{info.row.original.itemDescription}</p>
					</>
				);
			case 'filter': {
				const filterData = info.row.original.data as QuerysDataParsed;

				return (
					<div>
						{filterData.Categorias.length ? (
							<p className='mb-0 max-w-xl font-semibold'>
								Categorías:{' '}
								<span className='font-light'>
									{JSON.stringify(filterData.Categorias, null, 4)}
								</span>
							</p>
						) : (
							<></>
						)}
						{filterData.Marca && (
							<p className='mb-0 max-w-xl font-semibold'>
								Marca: <span className='font-light'>{filterData.Marca}</span>
							</p>
						)}
						{filterData.Orden && (
							<p className='mb-0 max-w-xl font-semibold'>
								Orden: <span className='font-light'>{filterData.Orden}</span>
							</p>
						)}
						{filterData['Palabras de búsqueda'].length ? (
							<p className='mb-0 max-w-xl font-semibold'>
								Palabras de búsqueda:{' '}
								<span className='font-light'>
									{filterData['Palabras de búsqueda']}
								</span>
							</p>
						) : (
							<></>
						)}
						{filterData.Página && (
							<p className='mb-0 max-w-xl font-semibold'>
								Página: <span className='font-light'>{filterData.Página}</span>
							</p>
						)}
						{filterData['Rango de precio'].length ? (
							<p className='mb-0 max-w-xl font-semibold'>
								Rango de precio:{' '}
								<span className='font-light'>
									{JSON.stringify(filterData['Rango de precio'], null, 4)}
								</span>
							</p>
						) : (
							<></>
						)}
					</div>
				);
			}
			default:
				return <></>;
		}
	};

	const getActionNameData = (actionType: StreamChatMessageType) => {
		switch (actionType) {
			case 'buy':
				return (
					<>
						<Icon
							icon='HeroShoppingCart'
							color='violet'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>Producto agregado al carrito</p>
					</>
				);
			case 'enter':
				return (
					<>
						<Icon
							icon='HeroArrowLeftOnRectangle'
							color='blue'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>LogIn</p>
					</>
				);
			case 'out':
				return (
					<>
						<Icon
							icon='HeroArrowRightOnRectangle'
							color='amber'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>LogOut</p>
					</>
				);
			case 'purchase':
				return (
					<>
						<Icon
							icon='HeroCurrencyDollar'
							color='emerald'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>Compra concretada</p>
					</>
				);
			case 'showProduct':
				return (
					<>
						<Icon
							icon='HeroEye'
							color='sky'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>Ver producto</p>
					</>
				);
			case 'filter':
				return (
					<>
						<Icon
							icon='HeroFunnel'
							color='lime'
							className='mr-2 h-full min-w-10 max-w-10 object-contain object-top'
						/>
						<p>Filtrar - Paginar</p>
					</>
				);
			default:
				return '';
		}
	};

	const columns = useMemo<ColumnDef<UsersActivity, any>[]>(
		() => [
			columnHelper.accessor('name', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Nombre',
				footer: 'Nombre',
				id: 'name',
			}),
			columnHelper.accessor('lastName', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Apellido',
				footer: 'Apellido',
				id: 'lastName',
			}),
			columnHelper.accessor('userEmail', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Email',
				footer: 'Email',
				id: 'userEmail',
			}),
			columnHelper.accessor('timestamp', {
				cell: (info) => <span>{timestampToDateAndHour(info.getValue() as number)}</span>,
				header: 'Hora',
				footer: 'Hora',
				id: 'timestamp',
			}),
			columnHelper.accessor('activityType', {
				cell: (info) => (
					<div className='dflex w-full items-center justify-start'>
						{getActionNameData(info.getValue() as StreamChatMessageType)}
					</div>
				),
				header: 'Acción',
				footer: 'Acción',
				id: 'activityType',
			}),
			columnHelper.accessor('device', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'Dispositivo',
				footer: 'Dispositivo',
				id: 'device',
			}),
			columnHelper.accessor('itemImgSrc', {
				cell: (info) => (
					<div className='dflex w-full justify-start'>
						{getActivityData(info.row.original.activityType, info)}
					</div>
				),
				header: 'Datos',
				footer: 'Datos',
				id: 'itemImgSrc',
			}),
		],
		//eslint-disable-next-line
		[columnHelper],
	);

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
		<PageWrapper name='Actividad de usuarios' className='usersActivity_section elementToShow'>
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
							<CardTitle>{`Actividad de usuarios en los últimos ${timeForSearchUsersActivity} minutos`}</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} items
							</Badge>
						</CardHeaderChild>
					</CardHeader>
					{data?.length ? (
						<>
							<CardBody className='overflow-auto'>
								<TableTemplate
									className='table-fixed max-md:min-w-[70rem]'
									table={table}
								/>
							</CardBody>
							<TableCardFooterTemplate table={table} />
						</>
					) : (
						<CardBody className='dflex justify-start overflow-auto'>
							<Icon
								icon='HeroExclamationTriangle'
								size='text-3xl'
								color='red'
								className='mr-2'
							/>
							No se encontraron registros
						</CardBody>
					)}
				</Card>
			</Container>
		</PageWrapper>
	);
};

export default UsersActivityPage;
