import { FormikProps, useFormik } from 'formik';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Input from '../../../components/form/Input';
import Label from '../../../components/form/Label';
import Container from '../../../components/layouts/Container/Container';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../components/layouts/Subheader/Subheader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card, { CardBody } from '../../../components/ui/Card';
import useSaveBtn from '../../../hooks/useSaveBtn';
import './orderView.page.css';

import OrderViewPageProductRow from '../../../components/DASHBOARD/orderViewPageProductRow/OrderViewPageProductRow';
import Textarea from '../../../components/form/Textarea';
import { SpinnerContext } from '../../../context/spinnerContext';
import { orderFormRequiredFields, paymentMethodsSelectData } from '../../../data';
import { showModal1 } from '../../../features/modalSlice';
import { deleteRows, getProductsByIDs, getTable, updateTable } from '../../../services/database';
import {
	BuyerTypeOptions,
	EditOrderNewProductExtraData,
	EditOrderProductDataModifiableFields,
} from '../../../types/DASHBOARD';
import {
	Detalle,
	Metodo_envio,
	Pano,
	Panoxproducto,
	Pedidos,
	Producto,
	Usuario,
} from '../../../types/DASHBOARD/database';
import { formatDateString, getIVAInfo, isFormChanged } from '../../../utils/utils';

const OrderViewPage = () => {
	const { id, print } = useParams();
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
	const [shippingMethods, setShippingMethods] = useState<Metodo_envio[] | null>(null);
	const [productsDetailsJSX, setProductsDetailsJSX] = useState<JSX.Element[] | null>(null);
	const [productsDetails, setProductsDetails] = useState<Detalle[]>([]);
	const productsDataToUpDate = useRef<
		{
			productID: number;
			data: EditOrderProductDataModifiableFields | null;
			newProductExtraData?: EditOrderNewProductExtraData;
		}[]
	>([]);
	const contentRef = useRef<HTMLDivElement>(null);
	const reactToPrintFn = useReactToPrint({ contentRef });

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
				'empresa',
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

				// Obtener los nombres de paños de cada producto
				const productsWithClothNames = await Promise.all(
					productsInOrderIDsArr.map(async (productID) => {
						// Obtener los IDs de paños asociados al producto
						const clothsIDsResponse = await getTable({
							tableName: 'panoxproducto',
							fields: ['id_pano'],
							conditions: [{ field: 'id_producto', value: productID }],
						});

						let clothNames: string[] = [];
						if (
							clothsIDsResponse.success &&
							clothsIDsResponse.data &&
							clothsIDsResponse.data.length
						) {
							const clothsIDs = clothsIDsResponse.data.map(
								(item: Panoxproducto) => item.id_pano,
							);

							// Obtener solo los nombres de los paños
							const clothsResponse = await getTable({
								tableName: 'pano',
								fields: ['nombre'],
								conditions: clothsIDs.map((clothId: number) => {
									return { field: 'id' as const, value: clothId };
								}),
							});

							if (clothsResponse.success && clothsResponse.data) {
								clothNames = clothsResponse.data.map(
									(cloth: Pick<Pano, 'nombre'>) => cloth.nombre,
								);
							}
						}

						return {
							productID,
							clothNames,
						};
					}),
				);

				if (response5.success && response5.data && response5.data.length) {
					const productsData: Producto[] = response5.data;

					const detailsDataWithProductsImages = detailsData.map((detail) => {
						const productFound = productsData.find(
							(product) => product.id === detail.id_producto,
						);

						const productClothNames =
							productsWithClothNames.find((p) => p.productID === detail.id_producto)
								?.clothNames || [];

						return {
							...detail,
							imageSrc: productFound?.thumbnail1 || '',
							nombre: productFound?.nombre,
							productID: productFound?.id,
							codigo: productFound?.codigo,
							cantidad: detail.cantidad,
							panos: productClothNames.join(', '), // Ya son solo los nombres
						};
					});

					setProductsDetails(detailsDataWithProductsImages);

					setProductsDetailsJSX(
						detailsDataWithProductsImages.map((detail, index) => (
							<OrderViewPageProductRow
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

	useEffect(() => {
		if (!id || !print) return;
		(async () => {
			const fields: (keyof Pedidos)[] = ['printedqty'];
			const response1 = await getTable({
				tableName: 'pedidos',
				conditions: [{ field: 'id', value: id }],
				fields,
			});
			if (!response1.success || !response1.data) return;
			const data = response1.data[0] as Pick<Pedidos, 'printedqty'>;
			const printedQty = data.printedqty;

			await updateTable({
				tableName: 'pedidos',
				conditions: [{ field: 'id', value: id }],
				data: { printedqty: printedQty ? printedQty + 1 : 1 },
			});
		})();
	}, [id, print]);

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

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
						Vista de pedido
					</Badge>
				</SubheaderLeft>
				<SubheaderRight>
					{print && (
						<Button
							icon='HeroPrinter'
							variant='solid'
							color='amber'
							onClick={() => reactToPrintFn()}>
							Imprimir
						</Button>
					)}
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
			<Container ref={contentRef} className='orderViewPageCont '>
				<div className='grid grid-cols-12 gap-2'>
					<div className='dflex col-span-12 justify-start'>
						<h3 className='m-0 mr-10 text-center font-bold'>Pedido #{id}</h3>
					</div>
					<div className='forNotebooks1366Page col-span-12 w-full'>
						<div className='col-span-12 flex flex-col gap-2 xl:col-span-6'>
							<Card>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='id'>Nombre y apellido</Label>
											<Input
												id='id'
												name='id'
												readOnly={true}
												value={`${userData?.nombre || ''} ${userData?.apellido || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='empresa'>Empresa</Label>
											<Input
												id='empresa'
												name='empresa'
												readOnly={true}
												value={userData?.empresa || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='ciudad'>Ciudad</Label>
											<Input
												id='ciudad'
												name='ciudad'
												readOnly={true}
												value={userData?.ciudad || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='provincia'>Provincia</Label>
											<Input
												id='provincia'
												name='provincia'
												readOnly={true}
												value={userData?.provincia || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='telefono'>Teléfono</Label>
											<Input
												id='stelefono'
												name='telefono'
												readOnly={true}
												value={userData?.telefono || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-4 lg:col-span-2'>
											<Label htmlFor='email'>Email</Label>
											<Input
												id='email'
												name='email'
												readOnly={true}
												value={`${userData?.email || ''}`}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-5 lg:col-span-2'>
											<Label htmlFor='id_metodo_envio'>
												Método de envío
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Input
												id='id_metodo_envio'
												name='id_metodo_envio'
												value={
													shippingMethods?.find(
														(method) =>
															method.id ===
															formik.values.id_metodo_envio,
													)?.nombre
												}
												onChange={formik.handleChange}
												readOnly={true}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-4 lg:col-span-2'>
											<Label htmlFor='pago_forma'>
												Método de pago
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Input
												id='pago_forma'
												name='pago_forma'
												onChange={formik.handleChange}
												value={
													paymentMethodsSelectData.find(
														(methodData) =>
															methodData.code ===
															formik.values.pago_forma,
													)?.text
												}
												readOnly={true}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='cuit'>Situación IVA</Label>
											<Input
												id='situacion'
												name='situacion'
												readOnly={true}
												value={aditionalInfo.IVAInfo}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-2 lg:col-span-2'>
											<Label htmlFor='dni'>CUIT / DNI</Label>
											<Input
												id='cuit'
												name='cuit'
												readOnly={true}
												value={userData?.cuit}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-3 lg:col-span-2'>
											<Label htmlFor='razon'>Razón social</Label>
											<Input
												id='razon'
												name='razon'
												readOnly={true}
												value={userData?.razon || ''}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-2 lg:col-span-2'>
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
										<div className='col-span-1 lg:col-span-2'>
											<Label htmlFor='unidades'>Unidades</Label>
											<Input
												id='unidades'
												name='unidades'
												readOnly={true}
												value={productsDetails.reduce(
													(acc, productDetail) =>
														productDetail.cantidad + acc,
													0,
												)}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-2 lg:col-span-2'>
											<Label htmlFor='total'>Total</Label>
											<Input
												id='total'
												name='total'
												readOnly={true}
												value={productsDetails.reduce(
													(acc, productDetail) =>
														productDetail.precio *
															productDetail.cantidad +
														acc,
													0,
												)}
												className='ordersInputsInfo'
											/>
										</div>
										<div className='col-span-7 lg:col-span-8'>
											<Label htmlFor='observaciones'>Observaciones</Label>
											<Textarea
												id='observaciones'
												name='observaciones'
												value={formik.values.observaciones}
												onChange={formik.handleChange}
												className='ordersInputsInfo h-12 resize-none'
												readOnly={true}
											/>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
					<div className='printContent col-span-12'>
						<div
							className='print-container flex flex-row flex-wrap'
							style={{ margin: '0', padding: '0' }}>
							{productsDetails.map((product: any, index) => (
								<div
									className='page-break h-[270px] w-[180px] border border-black p-2 text-center'
									key={index}>
									<p className='text-xs font-semibold'>{product?.codigo}</p>
									<p className='text-xs'>{product?.nombre}</p>
									<div className='flex justify-center'>
										<img
											width={120}
											height={120}
											src={product?.imageSrc || ''}
											alt='Product'
										/>
									</div>
									<p className='text-xs'>
										Precio: {product?.precio} - Cant.: {product?.cantidad}
									</p>
									{product?.panos && (
										<p className='text-xs'>Paño: {product?.panos}</p>
									)}
									<p className='text-xs text-blue-500'>
										Cantidad: {product?.cantidad}
									</p>
								</div>
							))}
						</div>
					</div>
					<div className='noPrint col-span-12 w-full'>
						<Card>
							<CardBody>
								<table className='orderPage_productsTable'>
									<thead>
										<tr>
											<th></th>
											<th>Producto</th>
											<th className='orderPageView_productCard_small_column'>
												Precio
											</th>
											<th className='orderPage_productsTable_smallColumn'>
												Cant.
											</th>
											<th className='orderPageView_productCard_small_column'>
												Total
											</th>
											<th className='orderPageView_productCard_small_column'>
												Stock
											</th>
											<th>Observaciones</th>
										</tr>
									</thead>
									<tbody>{productsDetailsJSX}</tbody>
								</table>
							</CardBody>
						</Card>
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default OrderViewPage;
