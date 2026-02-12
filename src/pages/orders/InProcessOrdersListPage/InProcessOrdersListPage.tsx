import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Icon from '../../../components/icon/Icon';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Badge from '../../../components/ui/Badge';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '../../../components/ui/Card';
import { Modal2Context } from '../../../context/modal2Context';
import { SpinnerContext } from '../../../context/spinnerContext';
import { showModal1 } from '../../../features/modalSlice';
import { deleteRowByID, getTable } from '../../../services/database';
import { Cart, Producto, Usuario } from '../../../types/DASHBOARD/database';
import {
	createProductsMap,
	createUsersMap,
	mapCartToCardData,
} from './inProcessOrders.helpers';
import { InProcessOrderCardData, PaginationState, ProductForCart, UserForCart } from './inProcessOrders.types';
import InProcessOrderCard from './_partial/InProcessOrderCard.partial';
import PaginationControls from './_partial/PaginationControls.partial';

const PAGE_SIZE = 20;

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const InProcessOrdersListPage: React.FC = () => {
	const dispatch = useDispatch();
	const { showSpinner } = useContext(SpinnerContext);
	const { setModal2 } = useContext(Modal2Context);

	const [loadingState, setLoadingState] = useState<LoadingState>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [cardsData, setCardsData] = useState<InProcessOrderCardData[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
		totalCount: 0,
	});
	const [emptyCartsCount, setEmptyCartsCount] = useState<number>(0);
	const [fetchedCountOnPage, setFetchedCountOnPage] = useState<number>(0);

	// Cached maps for users and products (loaded once)
	const [usersMap, setUsersMap] = useState<Map<string, UserForCart>>(new Map());
	const [productsMap, setProductsMap] = useState<Map<number, ProductForCart>>(new Map());

	/**
	 * Fetch carts with pagination and map to card data
	 */
	const fetchCarts = useCallback(
		async (pageIndex: number, users: Map<string, UserForCart>, products: Map<number, ProductForCart>) => {
			const offset = pageIndex * PAGE_SIZE;

			// Fetch paginated carts
			const cartsResponse = await getTable({
				tableName: 'carts',
				limit: PAGE_SIZE,
				offset,
				orderBy: { field: 'lastDate', order: 'desc' },
			});

			if (!cartsResponse.success) {
				throw new Error(cartsResponse.message || 'Error al obtener carritos');
			}

			// Fetch total count
			const countResponse = await getTable({
				tableName: 'carts',
				count: true,
			});

			const totalCount = countResponse.success && typeof countResponse.data === 'number'
				? countResponse.data
				: (cartsResponse.data?.length || 0);

			const carts: Cart[] = cartsResponse.data || [];

			// Map carts to card data, filtering out invalid ones (empty carts)
			const cards: InProcessOrderCardData[] = [];
			for (const cart of carts) {
				const cardData = mapCartToCardData(cart, users, products);
				if (cardData) {
					cards.push(cardData);
				}
			}

			// Track how many carts were fetched vs displayed (non-empty)
			const fetchedCount = carts.length;
			const emptyCount = fetchedCount - cards.length;

			return { cards, totalCount, fetchedCount, emptyCount };
		},
		[],
	);

	/**
	 * Initial load: fetch users, products, then carts
	 */
	const loadData = useCallback(async () => {
		setLoadingState('loading');
		showSpinner(true);
		setErrorMessage('');

		try {
			// Fetch users (needed for mapping)
			const usersFields: (keyof Usuario)[] = ['id', 'email', 'nombre', 'apellido'];
			const usersResponse = await getTable({ tableName: 'usuario', fields: usersFields });
			if (!usersResponse.success) {
				throw new Error(usersResponse.message || 'Error al obtener usuarios');
			}
			const users = createUsersMap(usersResponse.data || []);
			setUsersMap(users);

			// Fetch products (needed for thumbnails and prices)
			const productsFields: (keyof Producto)[] = ['id', 'precio', 'nombre', 'foto1', 'foto2'];
			const productsResponse = await getTable({ tableName: 'producto', fields: productsFields });
			if (!productsResponse.success) {
				throw new Error(productsResponse.message || 'Error al obtener productos');
			}
			const products = createProductsMap(productsResponse.data || []);
			setProductsMap(products);

			// Fetch initial page of carts
			const { cards, totalCount, fetchedCount, emptyCount } = await fetchCarts(0, users, products);
			setCardsData(cards);
			// Keep totalCount as raw DB count for pagination
			setPagination((prev) => ({ ...prev, pageIndex: 0, totalCount }));
			setFetchedCountOnPage(fetchedCount);
			setEmptyCartsCount(emptyCount);

			setLoadingState('success');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Error desconocido';
			setErrorMessage(message);
			setLoadingState('error');
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Error',
						subtitle: message,
						icon: 'error',
					},
				}),
			);
		} finally {
			showSpinner(false);
		}
	}, [dispatch, fetchCarts, showSpinner]);

	/**
	 * Handle page change
	 */
	const handlePageChange = useCallback(
		async (newPageIndex: number) => {
			showSpinner(true);
			try {
				const { cards, totalCount, fetchedCount, emptyCount } = await fetchCarts(newPageIndex, usersMap, productsMap);
				setCardsData(cards);
				// Keep totalCount as raw DB count for pagination
				setPagination((prev) => ({ ...prev, pageIndex: newPageIndex, totalCount }));
				setFetchedCountOnPage(fetchedCount);
				setEmptyCartsCount(emptyCount);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Error al cambiar de página';
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'Error',
							subtitle: message,
							icon: 'error',
						},
					}),
				);
			} finally {
				showSpinner(false);
			}
		},
		[dispatch, fetchCarts, productsMap, showSpinner, usersMap],
	);

	/**
	 * Handle delete cart action
	 */
	const handleDeleteCart = useCallback(
		(cartId: number, userName: string) => {
			setModal2({
				show: true,
				title: 'Borrar carrito',
				icon: 'warning',
				subtitle: `Se borrará permanentemente el carrito de "${userName}". ¿Desea continuar?`,
				firstButtonText: 'No, volver',
				secondButtonText: 'Sí, borrar',
				firstButtonFunction: () => setModal2({ show: false }),
				secondButtonFunction: async () => {
					setModal2({ show: false });
					showSpinner(true);

					try {
						const response = await deleteRowByID({ tableName: 'carts', rowID: cartId });
						if (response.success) {
							// Remove from local state
							setCardsData((prev) => prev.filter((card) => card.cartId !== cartId));
							setPagination((prev) => ({
								...prev,
								totalCount: Math.max(0, prev.totalCount - 1),
							}));
							dispatch(
								showModal1({
									show: true,
									info: {
										title: 'Carrito borrado',
										subtitle: `El carrito de "${userName}" fue borrado correctamente.`,
										icon: 'success',
									},
								}),
							);
						} else {
							throw new Error(response.message || 'Error al borrar carrito');
						}
					} catch (err) {
						const message = err instanceof Error ? err.message : 'Error al borrar';
						dispatch(
							showModal1({
								show: true,
								info: {
									title: 'Error',
									subtitle: message,
									icon: 'error',
								},
							}),
						);
					} finally {
						showSpinner(false);
					}
				},
			});
		},
		[dispatch, setModal2, showSpinner],
	);

	/**
	 * Handle send email (placeholder)
	 */
	const handleSendEmail = useCallback(() => {
		dispatch(
			showModal1({
				show: true,
				info: {
					title: 'Próximamente',
					subtitle: 'La funcionalidad de envío de email estará disponible pronto.',
					icon: 'info',
				},
			}),
		);
	}, [dispatch]);

	// Load data on mount
	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Render loading state
	if (loadingState === 'loading' && cardsData.length === 0) {
		return (
			<PageWrapper name='Pedidos en proceso'>
				<Container className='flex h-96 items-center justify-center'>
					<div className='text-center text-zinc-500'>
						<Icon icon='HeroArrowPath' size='text-4xl' className='mb-2 animate-spin' />
						<p>Cargando carritos...</p>
					</div>
				</Container>
			</PageWrapper>
		);
	}

	// Render error state
	if (loadingState === 'error') {
		return (
			<PageWrapper name='Pedidos en proceso'>
				<Container className='flex h-96 items-center justify-center'>
					<div className='text-center text-red-500'>
						<Icon icon='HeroExclamationTriangle' size='text-4xl' className='mb-2' />
						<p>{errorMessage || 'Error al cargar los datos'}</p>
					</div>
				</Container>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper name='Pedidos en proceso'>
			<Container>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Pedidos en proceso</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{cardsData.length} {cardsData.length === 1 ? 'carrito' : 'carritos'} en proceso
							</Badge>
							{emptyCartsCount > 0 && (
								<span className='ml-2 text-xs text-zinc-400'>
									({emptyCartsCount} {emptyCartsCount === 1 ? 'carrito vacío oculto' : 'carritos vacíos ocultos'})
								</span>
							)}
						</CardHeaderChild>
					</CardHeader>

					<CardBody className='p-4'>
						{/* Empty state */}
						{cardsData.length === 0 && (
							<div className='flex h-48 items-center justify-center text-zinc-500'>
								<div className='text-center'>
									<Icon icon='HeroShoppingCart' size='text-4xl' className='mb-2 opacity-50' />
									<p>No hay carritos en proceso</p>
								</div>
							</div>
						)}

						{/* Cards grid */}
						{cardsData.length > 0 && (
							<div className='grid grid-cols-12 justify-items-start gap-4'>
								{cardsData.map((card) => (
									<div
										key={card.cartId}
										className='col-span-12 md:col-span-6 lg:col-span-4 2xl:col-span-3'>
										<InProcessOrderCard
											data={card}
											onDeleteCart={handleDeleteCart}
											onSendEmail={handleSendEmail}
										/>
									</div>
								))}
							</div>
						)}
					</CardBody>

					{/* Pagination */}
					<PaginationControls
						pagination={pagination}
						displayedCount={cardsData.length}
						fetchedCount={fetchedCountOnPage}
						onPageChange={handlePageChange}
					/>
				</Card>
			</Container>
		</PageWrapper>
	);
};

export default InProcessOrdersListPage;
