import { FormikProps, useFormik } from 'formik';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../../components/form/Input';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../components/layouts/Subheader/Subheader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import useSaveBtn from '../../../hooks/useSaveBtn';
import './order.page.css';

import OrderPageProductRow from '../../../components/DASHBOARD/orderPageProductRow/OrderPageProductRow';
import Textarea from '../../../components/form/Textarea';
import Icon from '../../../components/icon/Icon';
import Tooltip from '../../../components/ui/Tooltip';
import { SpinnerContext } from '../../../context/spinnerContext';
import {
	orderFormRequiredFields,
	paymentMethodsSelectData,
	payStateSelectData,
} from '../../../data';
import { showModal1 } from '../../../features/modalSlice';
import {
	deleteRows,
	getProductsByIDs,
	getTable,
	insertRow,
	updateTable,
} from '../../../services/database';
import {
	BuyerTypeOptions,
	EditOrderNewProductExtraData,
	EditOrderNewProductListData,
	EditOrderProductDataModifiableFields,
} from '../../../types/DASHBOARD';
import {
	Detalle,
	Metodo_envio,
	Pedidos,
	Producto,
	Usuario,
	Vendedor,
} from '../../../types/DASHBOARD/database';
import {
	formatDateString,
	getIVAInfo,
	insertDotsInPrice,
	isFormChanged,
} from '../../../utils/utils';

const OrderPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = id === 'new';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [orderData, setOrderData] = useState<Partial<Pedidos> | null>(null);
	const initialData = useRef<Partial<Pedidos> | object>({});

	const [userData, setUserData] = useState<Partial<Usuario> | null>(null);
	const [sellersData, setSellersData] = useState<Partial<Vendedor>[] | null>(null);
	const [shippingMethods, setShippingMethods] = useState<Metodo_envio[] | null>(null);
	const [productsDetailsJSX, setProductsDetailsJSX] = useState<JSX.Element[] | null>(null);
	const productsDataToUpDate = useRef<
		{
			productID: number;
			data: EditOrderProductDataModifiableFields | null;
			newProductExtraData?: EditOrderNewProductExtraData;
		}[]
	>([]);
	const [newProductListJSX, setNewProductListJSX] = useState<JSX.Element[] | null>(null);
	const [newProductSelectedID, setNewProductSelectedID] = useState(0);

	const [aditionalInfo, setAditionalInfo] = useState<{
		IVAInfo: BuyerTypeOptions;
	}>({
		IVAInfo: '',
	});

	const [reloadOrderData, setReloadOrderData] = useState(false);

	const formik: FormikProps<Partial<Pedidos>> = useFormik({
		initialValues: {
			id: 0,
			usuario: 0,
			primer_pedido: 1,
			fecha: '',
			estado: '0',
			observaciones: '',
			id_metodo_envio: 0,
			pago_forma: '',
			pago_estado: 'P',
			vendedor: 0,
			costo_envio: 0,
		},
		onSubmit: async (values: Partial<Pedidos>) => {
			showSpinner(true);

			const orderPage_productCard_inputs = document.querySelectorAll(
				'.orderPage_productCard_input',
			); //Verifica si hay datos no guardados en las cards de productos
			const inputsArr = Array.from(orderPage_productCard_inputs);
			if (
				inputsArr.some(
					(input) => !input.classList.contains('orderPage_productCard_input_off'),
				)
			) {
				showSpinner(false);
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'warning',
							title: 'Acción cancelada',
							subtitle:
								'Por favor, guarde o cancele las modificaciones en los productos para continuar',
						},
					}),
				);
				return;
			}

			const emptyRequiredFieldsParsedArr: string[] = []; //Verifica si hay campos obligatorios vacíos
			orderFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				}
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(', ')}`,
						},
					}),
				);
				return;
			}

			const formChanged = isFormChanged(initialData.current, values);
			const productsDataChanged = productsDataToUpDate.current.length !== 0;
			if (!formChanged && !productsDataChanged) {
				//Si no hay cambios en el formulario no hacemos submit
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'info',
							title: 'No hay cambios para guardar',
							subtitle: 'No se modificó ningún campo',
						},
					}),
				);
				showSpinner(false);
				return;
			}

			if (formChanged) {
				const response = await updateTable({
					tableName: 'pedidos',
					conditions: [{ field: 'id', value: idParsed }],
					data: { ...formik.values },
				});
				if (response.success && response.data) {
					if (!productsDataChanged) {
						dispatch(
							showModal1({
								show: true,
								info: {
									icon: 'success',
									title: 'Actualización exitosa',
									subtitle: 'Pedido actualizado correctamente',
								},
							}),
						);
						setReloadOrderData((current) => !current);
					}
					initialData.current = structuredClone(values);
				} else {
					dispatch(
						showModal1({
							show: true,
							info: { icon: 'error', title: 'Error', subtitle: response.message },
						}),
					);
					return;
				}
			}

			if (productsDataChanged) {
				const promises = productsDataToUpDate.current.map(async (product) => {
					const conditions: { field: keyof Detalle; value: string | number }[] = [
						{ field: 'id_pedido', value: idParsed },
						{ field: 'id_producto', value: product.productID },
					];
					if (product.data && !product.newProductExtraData) {
						const data: Partial<Detalle> = {
							cantidad: product.data.cantidad,
							observaciones: product.data.observaciones,
							total: product.data.total,
						};
						await updateTable({ tableName: 'detalle', conditions, data });
					} else if (product.data && product.newProductExtraData) {
						const data: Detalle = {
							id_pedido: idParsed,
							id_producto: product.productID,
							cantidad: product.data.cantidad,
							observaciones: product.data.observaciones,
							total: product.data.total,
							...product.newProductExtraData,
						};
						await insertRow({ tableName: 'detalle', data });
						setNewProductSelectedID(0);
					} else if (!product.data) {
						await deleteRows({ tableName: 'detalle', conditions });
					}
				});
				await Promise.all(promises);
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'success',
							title: 'Actualización exitosa',
							subtitle: 'Pedido actualizado correctamente',
						},
					}),
				);
				productsDataToUpDate.current.length = 0;
				setReloadOrderData((current) => !current);
			}

			showSpinner(false);
		},
	});

	useEffect(() => {
		(async () => {
			showSpinner(true);
			setProductsDetailsJSX([]); //Cuando se recarga el componente con "reloadOrderData" limpiamos la lista de productos, sinó esta no se actualiza bien
			const orderFields: (keyof Pedidos)[] = [
				'id',
				'usuario',
				'primer_pedido',
				'fecha',
				'estado',
				'observaciones',
				'id_metodo_envio',
				'pago_forma',
				'pago_estado',
				'vendedor',
				'costo_envio',
				'total',
			];
			const reponse0 = await getTable({
				tableName: 'pedidos',
				conditions: [{ field: 'id', value: idParsed }],
				fields: orderFields,
			});
			if (reponse0.success && reponse0.data && reponse0.data.length) {
				const orderDataFromDB: Partial<Pedidos> = reponse0.data[0];
				setOrderData(orderDataFromDB);
			}
		})();
		//eslint-disable-next-line
	}, [idParsed, reloadOrderData]);

	useEffect(() => {
		if (!orderData) return;

		(async () => {
			const response1 = await getTable({
				tableName: 'vendedor',
				fields: ['codigo', 'nombre', 'id'],
			}); //Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			if (response1.success && response1.data && response1.data.length) {
				const sellersDataFromDB: Partial<Vendedor>[] = response1.data;
				setSellersData(sellersDataFromDB);
			}

			const userFields: (keyof Usuario)[] = [
				'nombre',
				'apellido',
				'email',
				'direccion',
				'ciudad',
				'provincia',
				'iva',
				'razon',
				'celular',
				'telefono',
				'razon',
				'cuit',
				'iva',
			];
			const response2 = await getTable({
				tableName: 'usuario',
				fields: userFields,
				conditions: [{ field: 'id', value: orderData.usuario || -1 }],
			}); //Si orderData.usuario es null getTable devolverá [] ya que -1  no puede exisitir como id
			if (response2.success && response2.data && response2.data.length) {
				const userDataFromDB: Partial<Usuario> = response2.data[0];
				setUserData(userDataFromDB);
			}

			const response3 = await getTable({ tableName: 'metodo_envio' });
			if (response3.success && response3.data && response3.data.length) {
				const shippingMethodsDataFromDB: Metodo_envio[] = response3.data;
				setShippingMethods(shippingMethodsDataFromDB);
			}

			const response4 = await getTable({
				tableName: 'detalle',
				conditions: [{ field: 'id_pedido', value: idParsed }],
			});
			if (response4.success && response4.data && response4.data.length) {
				const detailsData: Detalle[] = response4.data;
				const productsInOrderIDsArr = detailsData.map((detail) => detail.id_producto);

				const productFields: (keyof Producto)[] = ['id', 'foto1', 'nombre'];
				const response5 = await getProductsByIDs({
					iDsArr: productsInOrderIDsArr,
					fieldsArr: productFields,
				});
				if (response5.success && response5.data && response5.data.length) {
					const productsData: Producto[] = response5.data;

					const detailsDataWithProductsImages = detailsData.map((detail) => {
						const productFound = productsData.find(
							(product) => product.id === detail.id_producto,
						);
						return {
							...detail,
							imageSrc: productFound?.thumbnail1 || '',
							nombre: productFound?.nombre,
							productID: productFound?.id,
						};
					});

					setProductsDetailsJSX(
						detailsDataWithProductsImages.map((detail, index) => (
							<OrderPageProductRow
								key={index}
								calcPrice={detail.precioCalculado}
								imgSrc={detail.imageSrc}
								name={detail.nombre || ''}
								quantity={detail.cantidad}
								total={detail.total}
								observations={detail.observaciones}
								price={detail.precio}
								productID={detail.productID || 0}
								productsDataToUpDate={productsDataToUpDate.current}
							/>
						)),
					);
				}
			}

			const newProductListFields: (keyof Producto)[] = ['id', 'nombre'];
			const reponse5 = await getTable({
				tableName: 'producto',
				fields: newProductListFields,
			});
			if (reponse5.success && reponse5.data && reponse5.data.length) {
				const productsData: EditOrderNewProductListData = reponse5.data;
				productsData.sort((a, b) => a.nombre.localeCompare(b.nombre));
				setNewProductListJSX(
					productsData.map((product, index) => (
						<option key={index + 1} value={product.id} className='capitalize'>
							{product.nombre.toLowerCase()}
						</option>
					)),
				);
			}

			formik.setValues(orderData);
			initialData.current = structuredClone(orderData);

			showSpinner(false);
		})(); //Despues de leer la  base de datos actualizamos el estado de formik
		// eslint-disable-next-line
	}, [orderData]);

	useEffect(() => {
		if (!userData) return;
		setAditionalInfo({
			IVAInfo: getIVAInfo(userData.iva),
		});
	}, [userData, orderData]);

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	const handleNewProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setNewProductSelectedID(parseInt(e.target.value));
	};

	const addNewProduct = async () => {
		const response0 = await getTable({ tableName: 'multiplicador' });
		if (!response0.success || (!response0.data && !response0.data.length)) {
			dispatch(
				showModal1({
					show: true,
					info: {
						icon: 'error',
						title: 'Error al agregar producto',
						subtitle: `No se pudo obtener el multiplicador de precios: ${response0.message}`,
					},
				}),
			);
			return;
		}

		const globalMultiplier = response0.data[0].valor;

		const productFields: (keyof Producto)[] = ['foto1', 'nombre', 'precio', 'id', 'thumbnail1'];
		const response = await getProductsByIDs({
			iDsArr: [newProductSelectedID],
			fieldsArr: productFields,
		});
		if (response.success && response.data && response.data.length) {
			const productData: Pick<Producto, 'foto1' | 'nombre' | 'precio' | 'id' | 'thumbnail1'> =
				response.data[0];
			setProductsDetailsJSX((current) => [
				...(current || [<></>]),
				<OrderPageProductRow
					key={productData.id}
					calcPrice={globalMultiplier}
					imgSrc={productData.thumbnail1}
					name={productData.nombre}
					price={productData.precio}
					productID={productData.id}
					productsDataToUpDate={productsDataToUpDate.current}
					total={productData.precio}
					newProductExtraData={{
						precio: productData.precio,
						precioCalculado: globalMultiplier,
					}}
				/>,
			]);
		}
	};

	return (
		<PageWrapper name='Edición de pedido'>
			<Subheader>
				<SubheaderLeft>
					<Button icon='HeroArrowLeft' className='!px-0' onClick={() => navigate(-1)}>
						Volver
					</Button>
					<SubheaderSeparator />
					<Badge
						color='blue'
						variant='outline'
						rounded='rounded-full'
						className='border-transparent'>
						Edición de pedido
					</Badge>
				</SubheaderLeft>
				<SubheaderRight>
					<Button
						icon='HeroServer'
						variant='solid'
						color={saveBtnColor}
						isDisable={saveBtnDisable}
						onClick={() => formik.handleSubmit()}>
						{saveBtnText}
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container>
				<div className='grid grid-cols-12 gap-4'>
					<div className='dflex col-span-12 flex-wrap justify-start'>
						<h1 className='my-4 mr-10 text-center font-bold'>Edición de Pedido</h1>
					</div>
					<div className='forNotebooks1366Page col-span-12'>
						<div className='col-span-12 flex flex-col gap-4 xl:col-span-6'>
							<Card>
								<CardBody>
									<div className='flex w-full gap-4'>
										<p className='mb-0 w-full text-2xl font-bold'>
											<span className='text-base font-normal'>ID:</span>{' '}
											{orderData?.id}
										</p>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<p className='mb-0 text-2xl font-semibold'>
													Información del pedido
												</p>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con{' '}
													<span className='requiredFieldSymbol'>*</span>{' '}
													son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='primer_pedido'>Primer pedido</Label>
											<Input
												id='primer_pedido'
												name='primer_pedido'
												readOnly={true}
												value={`${typeof orderData?.primer_pedido === 'number' ? (orderData.primer_pedido === 1 ? 'Si' : 'No') : ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='fecha'>Fecha</Label>
											<Input
												id='fecha'
												name='fecha'
												readOnly={true}
												value={
													formik.values.fecha
														? formatDateString(formik.values.fecha)
														: ''
												}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='estado'>
												Estado<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Select
												id='estado'
												name='estado'
												value={formik.values.estado}
												onChange={formik.handleChange}>
												<option key={1} value={0}>
													Pendiente
												</option>
												<option key={2} value={1}>
													Despachado
												</option>
											</Select>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='observaciones'>Observaciones</Label>
											<Textarea
												id='observaciones'
												name='observaciones'
												value={formik.values.observaciones}
												onChange={formik.handleChange}
												className='h-24 resize-none'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id_metodo_envio'>
												Método de envío
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Select
												id='id_metodo_envio'
												name='id_metodo_envio'
												value={formik.values.id_metodo_envio || ''}
												onChange={formik.handleChange}>
												{shippingMethods?.map((method) => (
													<option key={method.id} value={method.id}>
														{method.nombre}
													</option>
												))}
												<option key='' value=''></option>{' '}
												{/*El select queda en blanco si no viene ningun metodo de envio*/}
											</Select>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='pago_forma'>
												Forma de pago
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Select
												id='pago_forma'
												name='pago_forma'
												value={formik.values.pago_forma || ''}
												onChange={formik.handleChange}>
												{paymentMethodsSelectData.map((methodData) => (
													<option
														key={methodData.code}
														value={methodData.code}>
														{methodData.text}
													</option>
												))}
												<option key='' value=''></option>{' '}
												{/*El select queda en blanco si no viene ningun metodo de pago*/}
											</Select>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='pago_forma'>
												Estado del pago
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Select
												id='pago_estado'
												name='pago_estado'
												value={formik.values.pago_estado || ''}
												onChange={formik.handleChange}>
												{payStateSelectData.map((payState) => (
													<option
														key={payState.code}
														value={payState.code}>
														{payState.text}
													</option>
												))}
												<option key='' value=''></option>{' '}
												{/*El select queda en blanco si no viene ningun metodo de pago*/}
											</Select>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='vendedor'>
												Vendedor
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Select
												id='vendedor'
												name='vendedor'
												value={formik.values.vendedor || ''}
												onChange={formik.handleChange}>
												{sellersData?.map((sellerData) => (
													<option
														key={sellerData.id}
														value={sellerData.codigo}>
														{sellerData.nombre}
													</option>
												))}
												<option key='' value=''></option>{' '}
												{/*El select queda en blanco si no viene ningun metodo de pago*/}
											</Select>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<p className='mb-0 text-2xl font-semibold'>
												Información de usuario
											</p>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>Nombre y apellido</Label>
											<Input
												id='id'
												name='id'
												readOnly={true}
												value={`${userData?.nombre || ''} ${userData?.apellido || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>Email</Label>
											<Input
												id='email'
												name='email'
												readOnly={true}
												value={userData?.email || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>Dirección</Label>
											<Input
												id='direccion'
												name='direccion'
												readOnly={true}
												value={`${userData?.direccion || ''}, ${userData?.ciudad || ''}, ${userData?.provincia || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>Celular / Teléfono</Label>
											<Input
												id='direccion'
												name='direccion'
												readOnly={true}
												value={`${userData?.celular || ''} / ${userData?.telefono || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>Situación frente al IVA</Label>
											<Input
												id='situacion'
												name='situacion'
												readOnly={true}
												value={aditionalInfo.IVAInfo}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='id'>
												Razon Social / Nombre completo
											</Label>
											<Input
												id='razon'
												name='razon'
												readOnly={true}
												value={`${userData?.razon || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardBody>
									<div className='grid grid-cols-12 gap-4 lg:col-span-6'>
										<div className='col-span-12'>
											<Label htmlFor='total'>Total</Label>
											<Input
												id='total'
												name='total'
												readOnly={true}
												value={
													typeof orderData?.total === 'number'
														? insertDotsInPrice(
																Math.ceil(orderData?.total),
															)
														: ''
												}
												className='ordersInputsInfo text-xl font-bold'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='costo_envio'>Costo de envío</Label>
											<Input
												id='costo_envio'
												name='costo_envio'
												readOnly={true}
												value={
													typeof orderData?.costo_envio === 'number'
														? insertDotsInPrice(
																Math.ceil(orderData.costo_envio),
															)
														: ''
												}
												className='ordersInputsInfo text-xl font-bold'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='IVA'>IVA</Label>
											<Input
												id='IVA'
												name='IVA'
												readOnly={true}
												value={
													typeof orderData?.total === 'number'
														? insertDotsInPrice(
																Math.ceil(orderData.total * 0.21),
															)
														: ''
												}
												className='ordersInputsInfo text-xl font-bold'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='totalIVA'>Total con IVA</Label>
											<Input
												id='totalIVA'
												name='totalIVA'
												readOnly={true}
												value={
													typeof orderData?.total === 'number'
														? insertDotsInPrice(
																Math.ceil(orderData.total * 1.21),
															)
														: ''
												}
												className='ordersInputsInfo text-xl font-bold'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='totalDisc'>Total con descuento</Label>
											<Input
												id='totalDisc'
												name='totalDisc'
												readOnly={true}
												value={
													typeof orderData?.total === 'number'
														? insertDotsInPrice(
																Math.ceil(
																	orderData.total * 1.21 * 0.9,
																),
															)
														: ''
												}
												className='ordersInputsInfo text-xl font-bold'
											/>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardBody>
									<div className='dflex mb-6 w-full'>
										<Select
											id='newProduct'
											name='newProduct'
											value={newProductSelectedID}
											className='mr-4 capitalize'
											onChange={handleNewProductChange}>
											<option key={0} value={0}>
												Elegir nuevo producto
											</option>
											{newProductListJSX}
										</Select>
										<Tooltip
											text={newProductSelectedID ? 'Agregar producto' : ''}>
											<Icon
												icon='HeroCheckCircle'
												color={newProductSelectedID ? 'emerald' : 'zinc'}
												size='text-5xl'
												style={{
													cursor: newProductSelectedID
														? 'pointer'
														: 'initial',
													opacity: newProductSelectedID ? '1' : '0.5',
												}}
												onClick={addNewProduct}
											/>
										</Tooltip>
									</div>

									<table className='orderPage_productsTable'>
										<thead>
											<tr>
												<th></th>
												<th>Producto</th>
												<th>Precio</th>
												<th>
													Precio
													<br />
													calculado
												</th>
												<th className='orderPage_productsTable_smallColumn'>
													Cant.
												</th>
												<th>Total</th>
												<th>Observaciones</th>
												<th></th>
												<th></th>
											</tr>
										</thead>
										<tbody>{productsDetailsJSX}</tbody>
									</table>
								</CardBody>
							</Card>
						</div>
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default OrderPage;
