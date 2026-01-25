import classNames from 'classnames';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Checkbox from '../../../../components/form/Checkbox';
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
import themeConfig from '../../../../config/theme.config';
import { showModal1 } from '../../../../features/modalSlice';
import {
	Categoria,
	Grupo,
	Marca,
	Multiplicador,
	Novedad,
	Pano,
	Panoxproducto,
	Producto,
} from '../../../../types/DASHBOARD/database';
import priceFormat from '../../../../utils/priceFormat.util';
import './productJoyas.css';

import DateInput1 from '../../../../components/DASHBOARD/forms/dateInput1/DateInput1';
import Button1 from '../../../../components/DASHBOARD/ui/button1/Button1';
import WaitImages from '../../../../components/DASHBOARD/waitImages/WaitImages';
import Select from '../../../../components/form/Select';
import Tooltip from '../../../../components/ui/Tooltip';
import { Modal2Context } from '../../../../context/modal2Context';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { productEditFormNotNegativeFields, productEditFormRequiredFields } from '../../../../data';
import useSaveBtn from '../../../../hooks/useSaveBtn';
import { deleteRows, getTable, insertRow, updateTable } from '../../../../services/database';
import { deleteFiles, uploadFiles } from '../../../../services/firebase';
import { ProductAditionalInfo, ProductImagesInfo } from '../../../../types/DASHBOARD/products';
import {
	convertDateFormat,
	fileToBase64,
	formatDateString,
	getCurrentDateFormatted,
	getProductFormParseValues,
	isFormChanged,
	showElement,
	waitAllImagesCharged,
} from '../../../../utils/utils';

const formikInitialValues: Partial<Producto> = {
	fecha_alta: '',
	categoria: 0,
	marca: 0,
	codigo: '',
	nombre: '',
	descripcion: '',
	estado: '0',
	order: 0, //"marca" viene de la base como número (id de la marca) y despues se pasa a string (Nombre de la marca)
	id_grupo: 0,
	precio: 0,
	con_descuento: false,
	porcentaje_descuento: 0,
	precio_full: undefined,
};

// Opciones de porcentaje de descuento (5, 10, 15... 100)
const discountPercentageOptions = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

const ProductPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);
	const initialData = useRef<Partial<Producto> | object>({});
	const dispatch = useDispatch();
	const [productAditionalInfo, setProductAditionalInfo] = useState<ProductAditionalInfo>({
		categories: [],
		brands: [],
		groups: [],
		news: [],
		isNews: false,
		newsID: 0,
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
	const [clothsData, setClothsData] = useState<{
		clothList: Pano[];
		clothIDSelected: number;
		clothsSelected: Pano[];
		clothsOfProduct: Pano[];
	}>({
		clothList: [],
		clothIDSelected: 0,
		clothsSelected: [],
		clothsOfProduct: [],
	});
	const initialClothsOfProduct = useRef<Pano[]>([]);
	const { setModal2 } = useContext(Modal2Context);

	const formik = useFormik({
		initialValues: formikInitialValues,
		onSubmit: async (values: Partial<Producto>) => {
			showSpinner(true);

			if (
				!isFormChanged(initialData.current, values) && //Si no hay cambios en el formulario no hacemos submit
				!productImages.foto1.file &&
				!productImages.foto2.file &&
				(!productImages.foto2.deleted ||
					(productImages.foto2.deleted && !values.foto2NameToDelete)) &&
				!isFormChanged(initialClothsOfProduct.current, clothsData.clothsSelected)
			) {
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

			const emptyRequiredFieldsArr: Array<keyof Partial<Producto>> = []; //Verifica si hay campos obligatorios vacíos
			productEditFormRequiredFields.forEach((requiredField) => {
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
			productEditFormNotNegativeFields.forEach((field) => {
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

			delete values.thumbnail1; //Los campos thumbnail1, thumbnail2 y precioDolar son generados por la API (no se devuelven)
			delete values.thumbnail2;
			delete values.precioDolar;

			if (typeof values.categoria === 'string') values.categoria = parseInt(values.categoria); //Los campos "categoria" y "marca" formik los pasa a string si se modifican
			if (typeof values.marca === 'string') values.marca = parseInt(values.marca); // por estar en inputs tipo select o checkbox. Si estan en string los pasamos a número

			if (productImages.foto1.file && values.foto1NameToDelete) {
				const response = await deleteFiles(values.foto1NameToDelete);
				if (!response.success) {
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'No se puedieron eliminar las imágenes del bucket',
								subtitle: response.message,
							},
						}),
					);
					showSpinner(false);
					return;
				}
			}

			if (productImages.foto2.file && values.foto2NameToDelete) {
				const response = await deleteFiles(values.foto2NameToDelete);
				if (!response.success) {
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'No se puedieron eliminar las imágenes del bucket',
								subtitle: response.message,
							},
						}),
					);
					showSpinner(false);
					return;
				}
			}

			if (productImages.foto2.deleted && values.foto2NameToDelete) {
				//Se entra a este if si se eliminó la foto 2
				const response = await deleteFiles(values.foto2NameToDelete);
				if (!response.success) {
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'No se pudo eliminar las imagen del bucket',
								subtitle: response.message,
							},
						}),
					);
					showSpinner(false);
					return;
				}
				productImages.foto2.deleted = false;
				values.foto2 = '';
			}

			if (productImages.foto2.deleted && !values.foto2NameToDelete) {
				productImages.foto2.deleted = false;
				values.foto2 = '';
			}

			delete values.foto1NameToDelete; //Los campos foto1NameToDelete y foto2NameToDelete son generados por la API (no se devuelven)
			delete values.foto2NameToDelete;

			if (productImages.foto1.file || productImages.foto2.file) {
				const imagesData = new FormData();
				if (productImages.foto1.file) imagesData.append('files', productImages.foto1.file);
				if (productImages.foto2.file) imagesData.append('files', productImages.foto2.file);
				const response = await uploadFiles(imagesData);
				if (response.success && response.data && response.data.length) {
					if (!productImages.foto2.file) values.foto1 = `${response.data[0]}`;
					if (!productImages.foto1.file) values.foto2 = `${response.data[0]}`;
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
								title: 'No se pudieron subir las imágenes',
								subtitle: response.message,
							},
						}),
					);
					showSpinner(false);
					return;
				}
			}

			if (isFormChanged(initialClothsOfProduct.current, clothsData.clothsSelected)) {
				//Solo actualizamos datos de paños si se realizo algun cambio en los mismos
				if (clothsData.clothsOfProduct.length) {
					//Solo eliminamos los datos antiguos de paños si el producto inicialmente tenia asignados paños
					const conditions: { field: keyof Panoxproducto; value: number }[] = [
						{ field: 'id_producto', value: idParsed },
					];
					const clearClothsReponse = await deleteRows({
						tableName: 'panoxproducto',
						conditions,
					});
					if (!clearClothsReponse.success || !clearClothsReponse.data) {
						dispatch(
							showModal1({
								show: true,
								info: {
									icon: 'error',
									title: 'No se pudieron actualizar los datos de paños',
									subtitle: clearClothsReponse.message,
								},
							}),
						);
						showSpinner(false);
						return;
					}
				}

				if (clothsData.clothsSelected.length) {
					//Solo agregamos paños al producto si hay paños seleccionados
					const clothsDataForUpdateInDB = clothsData.clothsSelected.map((clothData) => ({
						id_producto: idParsed,
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

			const auxValues = structuredClone(values);

			const response = await updateTable({
				tableName: 'producto',
				conditions: [{ field: 'id', value: idParsed }],
				data: auxValues,
			});
			if (response.success) {
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'success',
							title: 'Actualización exitosa',
							subtitle: 'Producto actualizado correctamente',
						},
					}),
				);
				initialData.current = structuredClone(values);
				initialClothsOfProduct.current = structuredClone(clothsData.clothsSelected); //Actualizamos datos iniciales de paños seleccionados
				productImages.foto1.file = null;
				productImages.foto2.file = null;
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

		const clothsIDsOfProductFields: (keyof Panoxproducto)[] = ['id_pano']; //Obtenemos el listado paños (IDs de paños) asignados al producto actual
		const clothsIDsOfProductResponse = await getTable({
			tableName: 'panoxproducto',
			fields: clothsIDsOfProductFields,
			conditions: [{ field: 'id_producto', value: idParsed }],
		});
		if (!clothsIDsOfProductResponse.success || !clothsIDsOfProductResponse.data) return;
		const clothsIDsOfProduct: Panoxproducto[] = clothsIDsOfProductResponse.data; //Obtenemos un array del tipo {id_pano: number}[];
		const clothsIDsOfProductArr: number[] = clothsIDsOfProduct.map(
			(clothOfProduct) => clothOfProduct.id_pano,
		); //Generamos un array de ID´s de paños asignados al producto actual

		const clothsOfProduct: Pano[] = clothList.filter((clothOfList) =>
			clothsIDsOfProductArr.includes(clothOfList.id),
		); //Obtenemos el listado paños (id y nombre) asignados al producto actual
		initialClothsOfProduct.current = structuredClone(clothsOfProduct); //Guardamos datos iniciales de paños seleccionados

		setClothsData((current) => ({
			...current,
			clothList,
			clothsOfProduct,
			clothsSelected: clothsOfProduct,
		}));
	};

	useEffect(() => {
		showSpinner(true);

		const fieldsProduct: Array<keyof Partial<Producto>> = [
			'foto1',
			'foto2',
			'order',
			'categoria',
			'marca',
			'codigo',
			'precio',
			'nombre',
			'descripcion',
			'fecha_alta',
			'precio',
			'estado',
			'id_grupo',
			'con_descuento',
			'porcentaje_descuento',
			'precio_full',
		];
		(async () => {
			await setClothsInfo(); //Añadimos datos de paños

			const newsFields: Array<keyof Novedad> = ['id_producto', 'id'];
			const newsResoponse = await getTable({ tableName: 'novedad', fields: newsFields });
			if (newsResoponse.success && newsResoponse.data && newsResoponse.data.length) {
				const news: Novedad[] = newsResoponse.data;
				setProductAditionalInfo((current) => ({ ...current, news }));
			}

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

			const response = await getTable({
				tableName: 'producto',
				fields: fieldsProduct,
				conditions: [{ field: 'id', value: idParsed }],
			}); //Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			if (response.success && response.data && response.data.length) {
				const productData: Partial<Producto> = response.data[0];

				delete productData.foto1; //Los campos foto1 y foto2 se piden a la base solo para que esta nos envíe los thumbnails. Los eliminamos
				delete productData.foto2; // y luego los volvemos a agregar si se modifica o agregan fotos

				productData.descripcion = productData.descripcion?.trim(); //Algunos productos vienen con espacios vacios en la descripción y al clickear, el cursor aparece en cualquier lugar

				// Aseguramos que los campos de descuento tengan valores por defecto si vienen null/undefined
				if (productData.con_descuento === null || productData.con_descuento === undefined) {
					productData.con_descuento = false;
				}
				if (productData.porcentaje_descuento === null || productData.porcentaje_descuento === undefined) {
					productData.porcentaje_descuento = 0;
				}

				formik.setValues({ ...formikInitialValues, ...productData });
				initialData.current = structuredClone(productData);

				setProductImages((current) => ({
					//Cargamos las imagenes que vienen de la base de datos en el form
					...current,
					foto1: {
						file: null,
						urlImage: productData.foto1 || '',
						urlThumbnail: productData.thumbnail1 || '',
						strB64: '',
						deleted: false,
					},
					foto2: {
						file: null,
						urlImage: productData.foto2 || '',
						urlThumbnail: productData.thumbnail2 || '',
						strB64: '',
						deleted: false,
					},
				}));
			} else {
				setModal2({
					show: true,
					title: 'Error',
					icon: 'error',
					firstButtonText: 'Volver',
					subtitle: response.message || 'No se pudieron obtener los datos del producto',
					firstButtonFunction: () => {
						setModal2({ show: false });
						navigate(-1);
					},
				});
				showSpinner(false);
				showElement(false);
			}
		})();
		//eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!productImages.foto1.urlThumbnail) return;

		(async () => {
			await waitAllImagesCharged();
			showSpinner(false);
			showElement(true); //Cerramos el spinner una vez que se cargó la foto1 del producto
		})();
		//eslint-disable-next-line
	}, [productImages.foto1.urlThumbnail]);

	useEffect(() => {
		if (!productAditionalInfo.news.length) return;
		const isNews = productAditionalInfo.news.find((news) => news.id_producto === idParsed); //Verificamos si el producto es novedad
		if (isNews) {
			setProductAditionalInfo((current) => ({ ...current, isNews: true, newsID: isNews.id }));
		}
	}, [productAditionalInfo.news, idParsed]);

	const handleDateChange = (dateStr: string) => {
		formik.setFieldValue('fecha_alta', convertDateFormat(dateStr));
	};

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
		isNewItem: false,
		isSaving: false,
		isDirty: formik.dirty,
	});

	const createNews = async () => {
		const newsData: Partial<Novedad> = {
			id_producto: idParsed,
			titulo: formik.values.nombre || '',
			slug: formik.values.nombre?.replace(/\s+/g, '_').toLowerCase() || '', //Reemplaza espacios por "_"
			subtitulo: '',
			descripcion: '',
			carrousel: '0',
			meta_title: '',
			habilitada: '1',
		};

		showSpinner(true);
		const response1 = await insertRow({ tableName: 'novedad', data: newsData });
		showSpinner(false);

		if (response1.success) {
			const newsID: number = response1.data[0];
			setProductAditionalInfo((current) => ({ ...current, isNews: true, newsID }));
			dispatch(
				showModal1({
					show: true,
					info: {
						icon: 'success',
						title: 'Novedad creada',
						subtitle: 'La novedad se ha creado correctamente',
					},
				}),
			);
		} else {
			dispatch(
				showModal1({
					show: true,
					info: {
						icon: 'error',
						title: 'Error',
						subtitle: `Ha ocurrido un error al crear la novedad: ${response1.message}`,
					},
				}),
			);
		}
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
		<PageWrapper name='Edición de producto' className='elementToShow'>
			<Subheader>
				<SubheaderLeft>
					<Button icon='HeroArrowLeft' className='!px-0' onClick={() => navigate(-1)}>
						Volver
					</Button>
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
						<h1 className='my-4 mr-10 text-center font-bold'>Edición de Producto</h1>
						<div className='dflex'>
							{productAditionalInfo.isNews ? (
								<Tooltip text='Este producto es novedad'>
									<Button1
										color='violet'
										variant='solid'
										icon='HeroBell'
										className=' pointer-events-none h-10 w-48'>
										Novedad
									</Button1>
								</Tooltip>
							) : (
								<Tooltip text='Este producto no es novedad'>
									<Button1
										color='zinc'
										variant='solid'
										className=' pointer-events-none h-10 w-48'>
										No es Novedad
									</Button1>
								</Tooltip>
							)}
						</div>
					</div>
					<div className='forNotebooks1366Page col-span-12'>
						{' '}
						{/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle className='dflex items-baseline'>
												<span className='mr-2 text-base font-normal'>
													ID:
												</span>{' '}
												{idParsed}
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
													defaultValue={
														formik.values.fecha_alta
															? formatDateString(
																	formik.values.fecha_alta,
																)
															: getCurrentDateFormatted()
													}
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
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='order'>Orden</Label>
												<Input
													type='number'
													id='order'
													name='order'
													onChange={formik.handleChange}
													value={formik.values.order}
												/>
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
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='con_descuento'>
													¿Con descuento?
												</Label>
												<Checkbox
													id='con_descuento'
													name='con_descuento'
													variant='switch'
													checked={formik.values.con_descuento}
													onChange={(e) => {
														formik.setFieldValue('con_descuento', e.target.checked);
														if (!e.target.checked) {
															formik.setFieldValue('porcentaje_descuento', 0);
															formik.setFieldValue('precio_full', undefined);
														}
													}}
													label={formik.values.con_descuento ? 'Sí' : 'No'}
												/>
											</div>
											{formik.values.con_descuento && (
												<>
													<div className='col-span-12 lg:col-span-6'>
														<Label htmlFor='porcentaje_descuento'>
															Porcentaje de descuento
															<span className='requiredFieldSymbol'>*</span>
														</Label>
														<Select
															id='porcentaje_descuento'
															name='porcentaje_descuento'
															value={formik.values.porcentaje_descuento ? formik.values.porcentaje_descuento.toString() : ''}
															onChange={(e) => {
																const porcentaje = Number(e.target.value);
																formik.setFieldValue('porcentaje_descuento', porcentaje);
																if (formik.values.precio_full && porcentaje > 0) {
																	const precioConDescuento = formik.values.precio_full - (formik.values.precio_full * porcentaje / 100);
																	formik.setFieldValue('precio', Math.round(precioConDescuento * 100) / 100);
																}
															}}>
															{discountPercentageOptions.map((percent) => (
																<option key={percent} value={percent.toString()}>
																	{percent}%
																</option>
															))}
														</Select>
													</div>
													<div className='col-span-12 lg:col-span-6'>
														<Label htmlFor='precio_full'>
															Precio Full
															<span className='requiredFieldSymbol'>*</span>
														</Label>
														<Input
															type='number'
															id='precio_full'
															name='precio_full'
															value={formik.values.precio_full ?? ''}
															onChange={(e) => {
																const { value } = e.target;
																const precioFull = value === '' ? undefined : Number(value);
																formik.setFieldValue('precio_full', precioFull);
																if (formik.values.porcentaje_descuento && precioFull && precioFull > 0) {
																	const precioConDescuento = precioFull - (precioFull * (formik.values.porcentaje_descuento || 0) / 100);
																	formik.setFieldValue('precio', Math.round(precioConDescuento * 100) / 100);
																}
															}}
														/>
													</div>
												</>
											)}
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='precio'>
													{formik.values.con_descuento ? 'Precio con Descuento' : 'Precio'}
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Input
													type='number'
													id='precio'
													name='precio'
													onChange={formik.handleChange}
													value={formik.values.precio}
													readOnly={formik.values.con_descuento}
													className={formik.values.con_descuento ? 'bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed' : ''}
												/>
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
											<div className='col-span-12 pr-12 lg:col-span-7'>
												<Label htmlFor='marca'>
													Marca
													<span className='requiredFieldSymbol'>*</span>
												</Label>
												<Select
													name='marca'
													onChange={formik.handleChange}
													value={formik.values.marca?.toString()}
													placeholder='Seleccionar Marca'>
													{productAditionalInfo.brands.map(
														(brand, index) => (
															<option
																key={index}
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
							<div className='col-span-12'>
								<Card>
									<CardBody>
										<div className='grid grid-cols-12 gap-4'>
											<div className='col-span-12 py-4 lg:col-span-6'>
												<p className='mb-4 text-xl font-medium'>
													Este producto es destacado
												</p>
												<Button
													rightIcon='HeroArrowTopRightOnSquare'
													variant='solid'
													color='emerald'
													className='pointers-events-none! w-56'
													onClick={() =>
														navigate('/sales/prominentsList')
													}>
													Ver listado
												</Button>
											</div>
											<div className='col-span-12 py-4 lg:col-span-6'>
												<p className='mb-4 text-xl font-medium'>
													{productAditionalInfo.isNews
														? 'Este producto es novedad'
														: 'Este producto no es novedad'}
												</p>
												<Button
													rightIcon={
														productAditionalInfo.isNews
															? 'HeroArrowTopRightOnSquare'
															: 'HeroBellAlert'
													}
													variant='solid'
													color={
														productAditionalInfo.isNews
															? 'violet'
															: 'zinc'
													}
													onClick={
														productAditionalInfo.isNews
															? () =>
																	navigate(
																		`/sales/news/${productAditionalInfo.newsID}`,
																	)
															: createNews
													}
													className='w-56'>
													{productAditionalInfo.isNews
														? 'Ver novedad'
														: 'Crear novedad'}
												</Button>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12 lg:col-span-6'>
								{' '}
								{/*Carga de fotos */}
								<Card>
									<CardHeader className=' min-h-20'>
										<CardHeaderChild>
											<CardTitle>Cambiar Foto 1</CardTitle>
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
														<span>Cambiar Imagen</span>
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
									<CardHeader className='min-h-20 content-between'>
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
															{productImages.foto2.strB64 ||
															productImages.foto2.urlThumbnail
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

export default ProductPage;
