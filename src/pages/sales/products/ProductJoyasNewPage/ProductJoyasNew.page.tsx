import classNames from 'classnames';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Input from '../../../../components/form/Input';
import Label from '../../../../components/form/Label';
import Radio, { RadioGroup } from '../../../../components/form/Radio';
import Icon from '../../../../components/icon/Icon';
import Container from '../../../../components/layouts/Container/Container';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Button from '../../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import { appPages } from '../../../../config/pages.config';
import themeConfig from '../../../../config/theme.config';
import { showModal1 } from '../../../../features/modalSlice';
import {
	Categoria,
	Grupo,
	Marca,
	Multiplicador,
	Pano,
	Producto,
} from '../../../../types/DASHBOARD/database';
import priceFormat from '../../../../utils/priceFormat.util';
import '../ProductPage/productJoyas.css';
import './productJoyasNew.page.css';

import DateInput1 from '../../../../components/DASHBOARD/forms/dateInput1/DateInput1';
import Button1 from '../../../../components/DASHBOARD/ui/button1/Button1';
import WaitImages from '../../../../components/DASHBOARD/waitImages/WaitImages';
import Select from '../../../../components/form/Select';
import Tooltip from '../../../../components/ui/Tooltip';
import { SpinnerContext } from '../../../../context/spinnerContext';
import {
	productNewFormNotNegativeFields,
	productNewFormNotZeroFields,
	productNewFormRequiredFields,
} from '../../../../data';
import useSaveBtn from '../../../../hooks/useSaveBtn';
import { getTable, insertRow } from '../../../../services/database';
import { uploadFiles } from '../../../../services/firebase';
import { ProductAditionalInfo, ProductImagesInfo } from '../../../../types/DASHBOARD/products';
import {
	convertDateFormat,
	fileToBase64,
	getCurrentDateFormatted,
	getProductFormParseValues,
} from '../../../../utils/utils';

const formikInitialValues: Partial<Producto> = {
	fecha_alta: '',
	categoria: '',
	marca: '',
	codigo: '',
	nombre: '',
	descripcion: '',
	precio: 0,
	estado: '0',
	id_grupo: 0,
	foto1: '',
	foto2: '',
	precioCalculado: 0,
	order: 1,
};

const ProductJoyasNewpage = () => {
	const { showSpinner } = useContext(SpinnerContext);
	const dispatch = useDispatch();
	const [dateSelected, setDateSelected] = useState('');

	const [productAditionalInfo, setProductAditionalInfo] = useState<ProductAditionalInfo>({
		categories: [],
		brands: [],
		groups: [],
		news: [],
		isNews: false,
		multiplier: 0,
	});

	const [productImages, setProductImages] = useState<ProductImagesInfo>({
		foto1: {
			file: null,
			urlImage: '',
			urlThumbnail: '',
			strB64: '',
			deleted: false,
		},
		foto2: {
			file: null,
			urlImage: '',
			urlThumbnail: '',
			strB64: '',
			deleted: false,
		},
	});

	const clothsDataInitialValues = {
		clothList: [],
		clothIDSelected: 0,
		clothsSelected: [],
		clothsOfProduct: [],
	};
	const [clothsData, setClothsData] = useState<{
		clothList: Pano[];
		clothIDSelected: number;
		clothsSelected: Pano[];
		clothsOfProduct: Pano[];
	}>(clothsDataInitialValues);

	const formik = useFormik({
		initialValues: formikInitialValues,
		onSubmit: async (values: Partial<Producto>) => {
			showSpinner(true);

			if (typeof values.categoria === 'string' && parseInt(values.categoria))
				values.categoria = parseInt(values.categoria); //Los campos "categoria", "marca", "id_grupo"  formik los pasa a string si se modifican
			if (typeof values.marca === 'string' && parseInt(values.marca))
				values.marca = parseInt(values.marca); // por estar en inputs tipo select o checkbox. Si estan en string los pasamos a número
			if (typeof values.id_grupo === 'string') values.id_grupo = parseInt(values.id_grupo);

			if (!values.fecha_alta)
				values.fecha_alta = convertDateFormat(getCurrentDateFormatted());

			const emptyRequiredFieldsArr: Array<keyof Partial<Producto>> = []; //Verifica si hay campos obligatorios vacíos
			productNewFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField]?.toString().trim()) {
					emptyRequiredFieldsArr.push(requiredField);
				}
			});
			if (emptyRequiredFieldsArr.length > 0) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: `Los siguientes campos no pueden estar vacios: ${getProductFormParseValues(emptyRequiredFieldsArr).join(', ')}`,
						},
					}),
				);
				showSpinner(false);
				return;
			}

			const negativeValues: Array<keyof Partial<Producto>> = []; //Verifica si hay valores negativos
			productNewFormNotNegativeFields.forEach((field) => {
				const value = values[field];
				if (typeof value === 'number' && value < 0) {
					negativeValues.push(field);
				}
			});
			if (negativeValues.length > 0) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: `Los siguientes campos no pueden tener valores negativos: ${getProductFormParseValues(negativeValues).join(', ')}`,
						},
					}),
				);
				showSpinner(false);
				return;
			}

			const zeroValues: Array<keyof Partial<Producto>> = []; //Verifica si hay valores no permitidos en cero
			productNewFormNotZeroFields.forEach((field) => {
				const value = values[field];
				if (typeof value === 'number' && value === 0) {
					zeroValues.push(field);
				}
			});
			if (zeroValues.length > 0) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: `Tiene que seleccionar una opción en los siguientes campos: ${getProductFormParseValues(zeroValues).join(', ')}`,
						},
					}),
				);
				showSpinner(false);
				return;
			}

			if (values.precio === 0) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: "El campo 'Precio' no puede ser 0",
						},
					}),
				);
				showSpinner(false);
				return;
			}

			if (!productImages.foto1.file && !productImages.foto2.file) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: 'Debe agregar al menos una imagen',
						},
					}),
				);
				showSpinner(false);
				return;
			}

			if (productImages.foto2.deleted && !values.foto2NameToDelete) {
				productImages.foto2.deleted = false;
				values.foto2 = '';
			}

			if (productImages.foto1.file || productImages.foto2.file) {
				const imagesData = new FormData();
				if (productImages.foto1.file) imagesData.append('files', productImages.foto1.file);
				if (productImages.foto2.file) imagesData.append('files', productImages.foto2.file);
				const response = await uploadFiles(imagesData);
				if (response.success && response.data && response.data.length) {
					if (!productImages.foto1.file || !productImages.foto2.file)
						values.foto1 = `${response.data[0]}`;
					if (productImages.foto1.file && productImages.foto2.file) {
						values.foto1 = `${response.data[0]}`;
						values.foto2 = `${response.data[1]}`;
					}
				} else if (!response.success) {
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'No se pudieron subr las imágenes',
								subtitle: response.message,
							},
						}),
					);
					showSpinner(false);
					return;
				}
			}

			values.precioCalculado = productAditionalInfo.multiplier;

			const response = await insertRow({ tableName: 'producto', data: values });
			if (response.success && response.data && response.data.length) {
				const newProductID: number = response.data[0];
				if (clothsData.clothsSelected.length) {
					//Solo agregamos paños al producto si hay paños seleccionados
					const clothsDataForUpdateInDB = clothsData.clothsSelected.map((clothData) => ({
						id_producto: newProductID,
						id_pano: clothData.id,
					}));
					const insertClothsResponse = await insertRow({
						tableName: 'panoxproducto',
						data: clothsDataForUpdateInDB,
					});
					if (
						!insertClothsResponse.success ||
						!insertClothsResponse.data ||
						!insertClothsResponse.data.length
					) {
						dispatch(
							showModal1({
								show: true,
								info: {
									icon: 'error',
									title: 'No se pudieron actualizar los datos de paños',
									subtitle: insertClothsResponse.message,
								},
							}),
						);
						showSpinner(false);
						return;
					}
				}

				setDateSelected(getCurrentDateFormatted());
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'success',
							title: 'Creación exitosa',
							subtitle: 'Producto creado correctamente',
						},
					}),
				);

				setProductImages({
					foto1: {
						file: null,
						urlImage: '',
						urlThumbnail: '',
						strB64: '',
						deleted: false,
					},
					foto2: {
						file: null,
						urlImage: '',
						urlThumbnail: '',
						strB64: '',
						deleted: false,
					},
				});

				formik.resetForm({
					values: formikInitialValues,
				});
				setClothsData(clothsDataInitialValues);
			} else {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle:
								'Se produjo un error al actualizar el producto, vuelva a intentar',
						},
					}),
				);
			}
			showSpinner(false);
		},
	});

	const setClothsInfo = async () => {
		const clothsListFields: (keyof Pano)[] = ['id', 'nombre']; //Obtenemos el listado total de paños con sus nombres e IDs para asignarlos al select del form
		const clothsListResponse = await getTable({ tableName: 'pano', fields: clothsListFields });
		if (
			!clothsListResponse.success ||
			!clothsListResponse.data ||
			!clothsListResponse.data.length
		)
			return;
		const clothList: Pano[] = clothsListResponse.data;
		clothList.sort((a, b) => a.nombre.trim().localeCompare(b.nombre.trim()));

		setClothsData((current) => ({ ...current, clothList }));
	};

	useEffect(() => {
		showSpinner(true);

		(async () => {
			await setClothsInfo();

			const categoriesFields: Array<keyof Categoria> = ['id', 'nombre'];
			const categoriesResoponse = await getTable({
				tableName: 'categoria',
				fields: categoriesFields,
			});
			if (
				categoriesResoponse.success &&
				categoriesResoponse.data &&
				categoriesResoponse.data.length
			) {
				const categories: Categoria[] = categoriesResoponse.data;
				setProductAditionalInfo((current) => ({ ...current, categories }));
			}

			const brandsFields: Array<keyof Marca> = ['id', 'descripcion'];
			const brandsResoponse = await getTable({ tableName: 'marca', fields: brandsFields });
			if (brandsResoponse.success && brandsResoponse.data && brandsResoponse.data.length) {
				const brands: Marca[] = brandsResoponse.data;
				setProductAditionalInfo((current) => ({ ...current, brands }));
			}

			const groupsFields: Array<keyof Grupo> = ['id', 'nombre', 'valor'];
			const groupsResoponse = await getTable({ tableName: 'grupo', fields: groupsFields });
			if (groupsResoponse.success && groupsResoponse.data && groupsResoponse.data.length) {
				const groups: Grupo[] = groupsResoponse.data;
				groups.sort((a, b) => a.nombre.trim().localeCompare(b.nombre.trim()));
				setProductAditionalInfo((current) => ({ ...current, groups }));
			}

			const multiplierFields: Array<keyof Multiplicador> = ['valor'];
			const multiplierResoponse = await getTable({
				tableName: 'multiplicador',
				fields: multiplierFields,
			});
			if (
				multiplierResoponse.success &&
				multiplierResoponse.data &&
				multiplierResoponse.data.length
			) {
				const multiplierData: Multiplicador = multiplierResoponse.data[0];
				const multiplier: number = multiplierData.valor;
				setProductAditionalInfo((current) => ({ ...current, multiplier }));
			}

			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, []);

	const handleInputFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			if (!e.target.files || !e.target.files.length) return;
			const file = e.target.files[0];
			const fileInB64String = await fileToBase64(file);
			const productImagesAux = structuredClone(productImages);
			productImagesAux[e.target.name as keyof ProductImagesInfo].strB64 = fileInB64String;
			productImagesAux[e.target.name as keyof ProductImagesInfo].file = file;
			setProductImages(productImagesAux);
		} catch (err) {
			const message = err instanceof Error ? 'ERROR: ' + err.message : 'ERROR: ' + err;
			dispatch(
				showModal1({
					show: true,
					info: { icon: 'error', title: 'Error al cargar imagen', subtitle: message },
				}),
			);
		}
	};

	const deleteFoto2 = () => {
		const foto2Input = document.querySelector('.foto2Input') as HTMLInputElement;
		if (foto2Input) {
			foto2Input.value = '';
		}
		setProductImages((current) => ({
			...current,
			foto2: {
				file: null,
				urlImage: '',
				urlThumbnail: '',
				strB64: '',
				deleted: true,
			},
		}));
	};

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem: true,
		isSaving: false,
		isDirty: formik.dirty,
	});

	const handleDateChange = (dateStr: string) => {
		if (!dateStr) return;
		formik.setFieldValue('fecha_alta', convertDateFormat(dateStr));
	};

	const handleChangeCloth = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const clothIDSelected = parseInt(e.target.value);
		setClothsData((current) => ({ ...current, clothIDSelected }));
	};

	const addClothToProduct = () => {
		//Agrega paño al listado de seleccionados
		const { clothsSelected, clothIDSelected } = clothsData;
		const clothsSelectedAux = structuredClone(clothsSelected);
		const clothDataToAdd = clothsData.clothList.find((cloth) => cloth.id === clothIDSelected);
		if (!clothDataToAdd) return;
		const clothAllreadyAdded = clothsSelectedAux.find(
			(clothInList) => clothInList.id === clothDataToAdd.id,
		);
		if (clothAllreadyAdded) {
			dispatch(
				showModal1({
					show: true,
					info: {
						icon: 'warning',
						title: 'Acción no permitida',
						subtitle: 'El paño ya está en la lista',
					},
				}),
			);
			return;
		}
		clothsSelectedAux.push(clothDataToAdd);
		setClothsData((current) => ({ ...current, clothsSelected: clothsSelectedAux }));
	};

	const deleteClothToProduct = (clothID: number) => {
		//Elimina paño del listado de seleccionados
		const { clothsSelected } = clothsData;
		const clothsSelectedAux = structuredClone(clothsSelected);
		const clothIndexToDelete = clothsSelectedAux.findIndex((cloth) => cloth.id === clothID);
		clothsSelectedAux.splice(clothIndexToDelete, 1);
		setClothsData((current) => ({ ...current, clothsSelected: clothsSelectedAux }));
	};

	return (
		<PageWrapper>
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.salesAppPages.subPages.productPage.subPages.listPage.to}`}>
						<Button icon='HeroArrowLeft' className='!px-0'>
							Ir a la lista
						</Button>
					</Link>
					<SubheaderSeparator />
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
						<h1 className='my-4 mr-10 text-center font-bold'>Creación de Producto</h1>
					</div>
					<div className='col-span-12 lg:col-span-9'>
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle className='dflex items-baseline'>
												<span className='mr-2 text-base font-normal'></span>
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4'>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='fecha_alta'>
													Fecha de alta
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<DateInput1
													inputChangeFunction={handleDateChange}
													defaultValue={getCurrentDateFormatted()}
													setValue={dateSelected}
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='codigo'>
													Código
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Input
													id='codigo'
													name='codigo'
													onChange={formik.handleChange}
													value={formik.values.codigo}
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='nombre'>
													Nombre
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Input
													id='nombre'
													name='nombre'
													onChange={formik.handleChange}
													value={formik.values.nombre}
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='description'>Descripción</Label>
												<Input
													id='descripcion'
													name='descripcion'
													value={formik.values.descripcion}
													onChange={formik.handleChange}
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='precio'>
													Precio
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Input
													type='number'
													id='precio'
													name='precio'
													onChange={formik.handleChange}
													value={formik.values.precio}
												/>
											</div>

											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='estado'>
													Estado
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Select
													name='estado'
													onChange={formik.handleChange}
													value={formik.values.estado}>
													<option key='0' value='0'>
														Deshabilitado
													</option>
													<option key='1' value='1'>
														Habilitado
													</option>
												</Select>
											</div>

											<div className='groupsSearchCont col-span-12 lg:col-span-6'>
												<Label htmlFor='id_grupo'>Grupo</Label>
												<Select
													id='id_grupo'
													name='id_grupo'
													onChange={formik.handleChange}
													value={formik.values.id_grupo}
													autoComplete='off'>
													<option key={0} value={0}>
														Sin Grupo
													</option>
													{productAditionalInfo.groups.map(
														(group, index) => (
															<option
																value={group.id}
																key={index + 1}>
																{`${group.nombre} --- $${priceFormat(group.valor * productAditionalInfo.multiplier)}`}
															</option>
														),
													)}
												</Select>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>Categoría & Marca</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4'>
											<div className='col-span-12'>
												<Label htmlFor='category'>
													Categoria
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<RadioGroup isInline>
													{productAditionalInfo.categories.map((cat) => (
														<Radio
															key={cat.id}
															label={cat.nombre}
															name='categoria'
															value={cat.id.toString()}
															selectedValue={formik.values.categoria?.toString()}
															onChange={formik.handleChange}
														/>
													))}
												</RadioGroup>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='marca'>
													Marca{' '}
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Select
													name='marca'
													onChange={formik.handleChange}
													value={formik.values.marca?.toString()}
													placeholder='Seleccionar Marca'>
													<option key={0} value=''></option>
													{productAditionalInfo.brands.map(
														(brand, index) => (
															<option
																key={index + 1}
																value={brand.id.toString()}>
																{brand.descripcion}
															</option>
														),
													)}
												</Select>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>Paños</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4'>
											<div className='col-span-12 mb-6 lg:col-span-7'>
												<Label htmlFor='cloth'>Paño a asignar</Label>
												<div className='dflex'>
													<Select
														name='cloth'
														onChange={handleChangeCloth}
														placeholder='Seleccionar Paño'>
														{clothsData.clothList.map(
															(cloth, index) => (
																<option
																	key={index}
																	value={cloth.id.toString()}>
																	{cloth.nombre}
																</option>
															),
														)}
													</Select>
													<Tooltip text='Agregar paño al producto'>
														<Icon
															icon='HeroPlusCircle'
															color='blue'
															size='text-4xl'
															className='ml-4'
															onClick={addClothToProduct}
														/>
													</Tooltip>
												</div>
											</div>

											{clothsData.clothsSelected.map((cloth, index) => (
												<div
													className='col-span-12 lg:col-span-7'
													key={index}>
													{index === 0 && (
														<Label htmlFor='cloth'>
															Paños del producto
														</Label>
													)}
													<div className='dflex'>
														<Input
															name='fecha_actualizacion'
															value={cloth.nombre}
															type='text'
															readOnly
															className='ordersInputsInfo'
														/>
														<Tooltip text='Eliminar paño del producto'>
															<Icon
																icon='HeroTrash'
																color='red'
																size='text-4xl'
																className='ml-4'
																onClick={() =>
																	deleteClothToProduct(cloth.id)
																}
															/>
														</Tooltip>
													</div>
												</div>
											))}
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12 lg:col-span-6'>
								{' '}
								{/*Carga de fotos */}
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>
												{productImages.foto1.strB64
													? 'Cambiar Foto 1'
													: 'Agregar Foto 1'}
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												'h-56',
											)}>
											<div className='dflex column h-full w-1/2 border border-dashed border-zinc-500/25 text-center'>
												<Icon
													icon='HeroPhoto'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='foto1'
														className={classNames(
															'relative',
															'cursor-pointer',
															'rounded-md',
															'font-semibold',
															'text-blue-500',
															'focus-within:outline-none',
															'focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:ring-offset-transparent',
															'hover:text-blue-600',
															themeConfig.transition,
														)}>
														<span>
															{productImages.foto1.file
																? 'Cambiar Imagen'
																: 'Subir Imagen'}
														</span>
														<input
															id='foto1'
															name='foto1'
															type='file'
															className='sr-only'
															onChange={handleInputFileChange}
															accept='image/*'
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PNG, JPG, GIF o JPEG hasta 2MB
												</p>
											</div>

											<div className='dflex column h-full w-1/2 border border-dashed border-zinc-500/25 text-center'>
												<WaitImages>
													{(productImages.foto1.strB64 && (
														<img
															src={productImages.foto1.strB64}
															alt=''
															className='h-full w-full object-contain'
														/>
													)) ||
														(productImages.foto1.urlThumbnail && (
															<img
																src={
																	productImages.foto1.urlThumbnail
																}
																alt=''
																className='h-full w-full object-contain'
															/>
														))}
												</WaitImages>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12 lg:col-span-6'>
								<Card>
									<CardHeader className='content-between'>
										<CardHeaderChild>
											<CardTitle>
												{productImages.foto2.strB64
													? 'Cambiar Foto 2'
													: 'Agregar Foto 2'}
											</CardTitle>
										</CardHeaderChild>
										{(productImages.foto2.strB64 ||
											formik.values.thumbnail2) && (
											<Button1
												color='red'
												variant='solid'
												onClick={deleteFoto2}>
												Eliminar
											</Button1>
										)}
									</CardHeader>
									<CardBody>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												'h-56',
											)}>
											<div className='dflex column h-full w-1/2 border border-dashed border-zinc-500/25 text-center'>
												<Icon
													icon='HeroPhoto'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='foto2'
														className={classNames(
															'relative',
															'cursor-pointer',
															'rounded-md',
															'font-semibold',
															'text-blue-500',
															'focus-within:outline-none',
															'focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:ring-offset-transparent',
															'hover:text-blue-600',
															themeConfig.transition,
														)}>
														<span>
															{productImages.foto2.file
																? 'Cambiar Imagen'
																: 'Subir Imagen'}
														</span>
														<input
															id='foto2'
															name='foto2'
															type='file'
															className='foto2Input sr-only'
															onChange={handleInputFileChange}
															accept='image/*'
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PNG, JPG, GIF o JPEG hasta 2MB
												</p>
											</div>

											<div className='dflex column h-full w-1/2 border border-dashed border-zinc-500/25 text-center'>
												<WaitImages>
													{(productImages.foto2.strB64 && (
														<img
															src={productImages.foto2.strB64}
															alt=''
															className='h-full w-full object-contain'
														/>
													)) ||
														(productImages.foto2.urlThumbnail && (
															<img
																src={
																	productImages.foto2.urlThumbnail
																}
																alt=''
																className='h-full w-full object-contain'
															/>
														))}
												</WaitImages>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default ProductJoyasNewpage;
