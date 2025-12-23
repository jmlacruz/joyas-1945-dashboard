import classNames from 'classnames';
import { FormikProps, useFormik } from 'formik';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Checkbox from '../../../../components/form/Checkbox';
import Input from '../../../../components/form/Input';
import Label from '../../../../components/form/Label';
import Container from '../../../../components/layouts/Container/Container';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import { appPages } from '../../../../config/pages.config';
import useSaveBtn from '../../../../hooks/useSaveBtn';

import Button1 from '../../../../components/DASHBOARD/ui/button1/Button1';
import WaitImages from '../../../../components/DASHBOARD/waitImages/WaitImages';
import Icon from '../../../../components/icon/Icon';
import themeConfig from '../../../../config/theme.config';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { brandRequiredFields } from '../../../../data';
import { showModal1 } from '../../../../features/modalSlice';
import { getTable, updateTable } from '../../../../services/database';
import { deleteDocument, deleteFiles, uploadDocument, uploadFiles } from '../../../../services/firebase';
import { BrandDocumentsInfo, BrandImagesInfo, DocumentsInfoOfBrand, ImagesInfoOfBrand, Marca } from '../../../../types/DASHBOARD/database';
import { fileToBase64, isFormChanged } from '../../../../utils/utils';

const BrandPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const initialData = useRef<Partial<Marca> | object>({});

	const [toggleReloadTable, setToggleReloadTable] = useState(false);

	const [brandImages, setBrandImages] = useState<BrandImagesInfo>({
		frontPage: {
			file: null,
			url: "",
			strB64: "",
			deleted: false,
		},
		logo: {
			file: null,
			url: "",
			strB64: "",
			deleted: false,
		}
	});

	const [brandDocuments, setBrandDocuments] = useState<BrandDocumentsInfo>({
		pdf: {
			file: null,
			url: "",
			deleted: false,
		},
		recommended_pdf: {
			file: null,
			url: "",
			deleted: false,
		}
	});

	const formik: FormikProps<Partial<Marca>> = useFormik({
		initialValues: {
			id: 0,
			orden: 0,
			descripcion: "",
			imagen: "",
			link: "",
			estado: "0",
			logo: "",
			pdf: "",
			pdf_recomendado: "",
		},
		onSubmit: async (values: Partial<Marca>) => {
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];																		//Verifica si hay campos obligatorios vacíos
			brandRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}` } }));
				return;
			};
	
			if (!isFormChanged(initialData.current, values) &&																					//No hay cambios en el formulario
				!brandImages.frontPage.file &&																									//No hay una portada adjuntada
				!brandImages.logo.file &&																										//No hay un logo adjuntado
				!brandImages.frontPage.deleted &&																								//No se eliminó la foto de portada
				!brandImages.logo.deleted	&&																									//No se eliminó la imagen del logo
				!brandDocuments.pdf.file &&																										//No hay un pdf adjuntado
				(!brandDocuments.pdf.deleted ||	(brandDocuments.pdf.deleted && !values.pdfNameToDelete)) &&										//No se eliminó el pdf - O se eliminó y no hay uno para borrar (Cuando inicialmente el input no tiene archivo y ponemos y sacamos el mismo)
				!brandDocuments.recommended_pdf.file &&																							//No hay un pdf recomendado adjuntado
				(!brandDocuments.recommended_pdf.deleted || (brandDocuments.recommended_pdf.deleted && !values.pdfRecomendadoNameToDelete))		//No se eliminó pdf recomendado adjuntado - O se eliminó y no hay uno para borrar (Cuando inicialmente el input no tiene archivo y ponemos y sacamos el mismo)
			) {														
				dispatch(showModal1({ show: true, info: { icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo" } }));
				showSpinner(false);
				return;
			}

			/***************************** Verificación de imágenes ****************************/

			if ((brandImages.frontPage.file && values.imagenNameToDelete) || (brandImages.frontPage.deleted && values.imagenNameToDelete)) {
				const response = await deleteFiles(values.imagenNameToDelete);
				if (!response.success) {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "No se pudo eliminar la imagen de portada bucket", subtitle: response.message } }));
					showSpinner(false);
					return; 
				}
				brandImages.frontPage.deleted = false;
				values.imagen = "";
			} 
			if (brandImages.frontPage.deleted && !values.imagenNameToDelete) {								//Se elimina la imagen de portada cuya url no es de firebase
				brandImages.frontPage.deleted = false;
				values.imagen = "";
			}

			if ((brandImages.logo.file && values.logoNameToDelete) || (brandImages.logo.deleted && values.logoNameToDelete)) {
				const response = await deleteFiles(values.logoNameToDelete);
				if (!response.success) {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "No se pudo eliminar la imagen del logo del bucket", subtitle: response.message } }));
					showSpinner(false);
					return; 
				}
				brandImages.logo.deleted = false;
				values.logo = "";
			} 
			if (brandImages.logo.deleted && !values.logoNameToDelete) {										//Se elimina la imagen del logo cuya url no es de firebase
				brandImages.logo.deleted = false;
				values.logo = "";
			}

			delete values.imagenNameToDelete;																//Los campos imagenNameToDelete y logoNameToDelete son generados por la API (no se devuelven)
			delete values.logoNameToDelete;
		
			if (brandImages.frontPage.file || brandImages.logo.file) {
				const imagesData = new FormData();
				if (brandImages.frontPage.file) imagesData.append("files", brandImages.frontPage.file);
				if (brandImages.logo.file) imagesData.append("files", brandImages.logo.file);
				const response = await uploadFiles(imagesData, false);										//Ponemos false para que las imagenes no se redimensionen (No hay que achicar la portada)
				if (response.success && response.data && response.data.length) {
					if (!brandImages.frontPage.file) values.logo = `firebase/${response.data[0]}`;
					if (!brandImages.logo.file) values.imagen = `firebase/${response.data[0]}`;
					if (brandImages.frontPage.file && brandImages.logo.file) {
						values.imagen = `firebase/${response.data[0]}`;
						values.logo = `firebase/${response.data[1]}`;
					}
				}else if (!response.success) {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "No se pudieron subir las imágenes", subtitle: response.message } }));
					showSpinner(false);
					return;
				}
			}

			/**************************** Verificación de documentos ******************************/
			
			if ((brandDocuments.pdf.file && values.pdfNameToDelete) || (brandDocuments.pdf.deleted && values.pdfNameToDelete)) {
				const response = await deleteDocument(values.pdfNameToDelete);
				if (!response.success) {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "No se pudo eliminar el documento de costos del bucket", subtitle: response.message } }));
					showSpinner(false);
					return; 
				}
				brandDocuments.pdf.deleted = false;
				values.pdf = "";
			} 
			if (brandDocuments.pdf.deleted && !values.pdfNameToDelete) {								//Se elimina la imagen de portada cuya url no es de firebase
				brandDocuments.pdf.deleted = false;
				values.pdf = "";
			}

			if ((brandDocuments.recommended_pdf.file && values.pdfRecomendadoNameToDelete) || (brandDocuments.recommended_pdf.deleted && values.pdfRecomendadoNameToDelete)) {
				const response = await deleteDocument(values.pdfRecomendadoNameToDelete);
				if (!response.success) {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "No se pudo eliminar el documento de costos del bucket", subtitle: response.message } }));
					showSpinner(false);
					return; 
				}
				brandDocuments.recommended_pdf.deleted = false;
				values.pdf_recomendado = "";
			} 
			if (brandDocuments.recommended_pdf.deleted && !values.pdfRecomendadoNameToDelete) {								//Se elimina la imagen de portada cuya url no es de firebase
				brandDocuments.recommended_pdf.deleted = false;
				values.pdf_recomendado = "";
			}

			delete values.pdfRecomendadoNameToDelete;
			delete values.pdfNameToDelete;
			delete values.pdfRecomendadoName;
			delete values.pdfName;

			if (brandDocuments.recommended_pdf.file || brandDocuments.pdf.file) {
				if (brandDocuments.recommended_pdf.file) {
					const recommended_pdfData = new FormData();
					recommended_pdfData.append("file", brandDocuments.recommended_pdf.file);
					const response = await uploadDocument(recommended_pdfData);		
					if (response.success && response.data) {
						values.pdf_recomendado = `firebase/${response.data}`;
					} else {
						dispatch(showModal1({ show: true, info: { icon: "error", title: "Error al subir PDF Costo", subtitle: response.message } }));
						showSpinner(false);
						return;
					}			
				}
				if (brandDocuments.pdf.file) {
					const pdfData = new FormData();
					pdfData.append("file", brandDocuments.pdf.file);
					const response = await uploadDocument(pdfData);		
					if (response.success && response.data) {
						values.pdf = `firebase/${response.data}`;	
					} else {
						dispatch(showModal1({ show: true, info: { icon: "error", title: "Error al subir PDF Recomendado", subtitle: response.message } }));
						showSpinner(false);
						return;
					}		
				}
			}

			const response = await updateTable({ tableName: "marca", conditions: [{ field: "id", value: idParsed }], data: formik.values });
			if (response.success) {
				dispatch(showModal1({ show: true, info: { icon: "success", title: "Actualización exitosa", subtitle: "Marca actualizada correctamente" } }));
				initialData.current = structuredClone(values);								//Guardamos los valores actualizados del formulario para volver a verificar cambios
				brandImages.frontPage.file = null;
				brandImages.logo.file = null;
				brandDocuments.pdf.file = null;
				brandDocuments.recommended_pdf.file = null;

				setToggleReloadTable((current) => !current);
			} else {
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: response.message } }));
			}

			showSpinner(false);
		}
	});

	const handleCheckChange = (e: React.ChangeEvent) => {
		const { name, checked } = e.target as HTMLInputElement;
		formik.setFieldValue(name, checked ? '1' : '0');
	};

	useEffect(() => {
		(async () => {
			showSpinner(true);

			const response1 = await getTable({ tableName: "marca", conditions: [{ field: "id", value: idParsed }] });
			if (response1.success && response1.data && response1.data.length) {
				const data: Partial<Marca> = response1.data[0];
						
				const brandDataAux = structuredClone(data);
				delete brandDataAux.imagen;																				//Borramos los campos "imagen", "logo" ya que vienen con la ruta completa
				delete brandDataAux.logo;																				// solo tenemos que devolver su nombre cuando se agrega o cambia un logo o portada
				delete brandDataAux.thumbnailImagen;																	//Borramos los campos "thumbnailImagen" y "thumbnailLogo" (que genera la API) ya que no se devuelven
				delete brandDataAux.thumbnailLogo;

				delete brandDataAux.pdf;
				delete brandDataAux.pdf_recomendado;
				
				formik.setValues(brandDataAux);
											
				setBrandImages((current) => ({																			//Cargamos las imagenes que vienen de la base de datos en el form
					...current,
					frontPage: {
						file: null,
						url: data.thumbnailImagen || data.imagen || "",
						strB64: "",
						deleted: false,
					} as ImagesInfoOfBrand,
					logo: {
						file: null,
						url: data.thumbnailLogo || data.logo || "",
						strB64: "",
						deleted: false,
					} as ImagesInfoOfBrand,
				}));

				setBrandDocuments((current) => ({																			//Cargamos las imagenes que vienen de la base de datos en el form
					...current,
					pdf: {
						file: null,
						url: data.pdf || "",
						deleted: false,
					} as DocumentsInfoOfBrand,
					recommended_pdf: {
						file: null,
						url: data.pdf_recomendado || "",
						deleted: false,
					} as DocumentsInfoOfBrand,
				}));
																									
				initialData.current = structuredClone(brandDataAux);
			}

			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [idParsed, toggleReloadTable])
	
	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	const handleInputFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			if (!e.target.files || !e.target.files.length) return;
			const file = e.target.files[0];
			const fileInB64String = await fileToBase64(file);
			const productImagesAux = structuredClone(brandImages);
			productImagesAux[e.target.name as keyof BrandImagesInfo].strB64 = fileInB64String;
			productImagesAux[e.target.name as keyof BrandImagesInfo].file = file;
			setBrandImages(productImagesAux);
		} catch (err) {
			const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
			dispatch(showModal1({ show: true, info: { icon: "error", title: "Error al cargar imagen", subtitle: message } }));
		}
	};

	const handleInputDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			if (!e.target.files || !e.target.files.length) return;
			const file = e.target.files[0];
			const productDocumentsAux = structuredClone(brandDocuments);
			productDocumentsAux[e.target.name as keyof BrandDocumentsInfo].file = file;
			setBrandDocuments(productDocumentsAux);
		} catch (err) {
			const message = err instanceof Error ? "ERROR: " + err.message : "ERROR: " + err;
			dispatch(showModal1({ show: true, info: { icon: "error", title: "Error al cargar documento", subtitle: message } }));
		}
	};

	const deleteImage = (imageType: keyof BrandImagesInfo) => {
		if (imageType === "frontPage") {
			const frontPageInput = document.querySelector(".frontPageInput") as HTMLInputElement;
			if (frontPageInput) {
				frontPageInput.value = "";
			}
		} else {
			const logoInput = document.querySelector(".logoInput") as HTMLInputElement;
			if (logoInput) {
				logoInput.value = "";
			}
		}
		setBrandImages((current) => ({
			...current,
			[imageType]: {
				file: null,
				url: "",
				strB64: "",
				deleted: true,
			} as ImagesInfoOfBrand
		}));
	};

	const deleteDocumentInput = (documentType: keyof BrandDocumentsInfo) => {
		if (documentType === "pdf") {
			const PDFInput = document.querySelector(".brandPDFfInput") as HTMLInputElement;
			if (PDFInput) {
				PDFInput.value = "";
			}
		} else {
			const recommended_PDFInput = document.querySelector(".recommendedPDFInput") as HTMLInputElement;
			if (recommended_PDFInput) {
				recommended_PDFInput.value = "";
			}
		}
		setBrandDocuments((current) => ({
			...current,
			[documentType]: {
				file: null,
				url: "",
				deleted: true,
			} as DocumentsInfoOfBrand
		}));
	};

	return (
		<PageWrapper name={formik.values.id?.toString()}>
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.salesAppPages.subPages.productPage.subPages.BrandsListPage.to}`}>
						<Button icon='HeroArrowLeft' className='!px-0'>
							Ir a la lista
						</Button>
					</Link>
					<SubheaderSeparator />
					<Badge
						color='blue'
						variant='outline'
						rounded='rounded-full'
						className='border-transparent'>
						Edición de marca
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
					<div className='col-span-12 forNotebooks1366Page'>    {/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>
												<div>
													<div>Edición de marca</div>
													<div className='text-base font-normal text-zinc-500'>
														Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
													</div>
												</div>
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4 formFieldsMarginBottom'>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='id'>ID</Label>
												<Input
													id='id'
													name='id'
													readOnly={true}
													value={idParsed}
													autoComplete='id'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='orden'>Orden <span className='requiredFieldSymbol'>*</span></Label>
												<Input
													id='orden'
													name='orden'
													onChange={formik.handleChange}
													value={formik.values.orden}
													autoComplete='orden'
													type='number'
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='descripcion'>Descripción <span className='requiredFieldSymbol'>*</span></Label>
												<Input
													id='descripcion'
													name='descripcion'
													onChange={formik.handleChange}
													value={formik.values.descripcion}
													autoComplete='descripcion'
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='link'>Link</Label>
												<Input
													id='link'
													name='link'
													onChange={formik.handleChange}
													value={formik.values.link}
													autoComplete='link'
												/>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>

							<div className='col-span-12 lg:col-span-6'>											{/*Carga de fotos */}
								<Card>
									<CardHeader className='content-between min-h-20'>
										<CardHeaderChild>
											<CardTitle>{brandImages.frontPage.strB64 || brandImages.frontPage.url ? "Cambiar portada" : "Subir portada"}</CardTitle>
										</CardHeaderChild>
										{(brandImages.frontPage.strB64 || brandImages.frontPage.url) && <Button1 color="red" variant="solid" onClick={() => deleteImage("frontPage")}>Eliminar</Button1>}
									</CardHeader>
									<CardBody>
										<span>Archivo JPG, ancho: 1920px, alto: 360px</span>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												"h-56",
											)}>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 h-full'>
												<Icon
													icon='HeroPhoto'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='frontPage'
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
														<span>Subir Imagen</span>
														<input
															id='frontPage'
															name='frontPage'
															type='file'
															className='sr-only frontPageInput'
															onChange={handleInputFileChange}
															accept="image/*"
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PNG, JPG, GIF o JPEG hasta 2MB
												</p>
											</div>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 h-full'>
												<WaitImages>
													{
														(brandImages.frontPage.strB64 && <img src={brandImages.frontPage.strB64} alt="" className="w-full h-full object-contain" />)
														||
														(brandImages.frontPage.url && <img src={brandImages.frontPage.url} alt="" className="w-full h-full object-contain" />)
													}
												</WaitImages>
											</div>

										</div>
									</CardBody>
								</Card>	
							</div>
							<div className='col-span-12 lg:col-span-6'>
								<Card>
									<CardHeader className="content-between min-h-20">
										<CardHeaderChild >
											<CardTitle>{brandImages.logo.strB64 || brandImages.logo.url ? "Cambiar logo" : "Subir logo"}</CardTitle>
										</CardHeaderChild>
										{(brandImages.logo.strB64 || brandImages.logo.url) && <Button1 color="red" variant="solid" onClick={() => deleteImage("logo")}>Eliminar</Button1>}
									</CardHeader>
									<CardBody>
										<span>Archivo PNG, alto: 24px</span>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												"h-56",
											)}>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 h-full'>
												<Icon
													icon='HeroPhoto'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='logo'
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
														<span>Subir Imagen</span>
														<input
															id='logo'
															name='logo'
															type='file'
															className='sr-only logoInput'
															onChange={handleInputFileChange}
															accept="image/*"
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PNG, JPG, GIF o JPEG hasta 2MB
												</p>
											</div>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 h-full'>
												<WaitImages>
													{
														(brandImages.logo.strB64 && <img src={brandImages.logo.strB64} alt="" className="w-full h-full object-contain" />)
														||
														(brandImages.logo.url && <img src={brandImages.logo.url} alt="" className="w-full h-full object-contain" />)
													}
												</WaitImages>
											</div>

										</div>
									</CardBody>
								</Card>
							</div>

							<div className='col-span-12 lg:col-span-6'>											{/*Carga de documentos */}
								<Card>
									<CardHeader className='content-between min-h-20'>
										<CardHeaderChild>
											<CardTitle className='text-xl'>{brandDocuments.pdf.url || brandDocuments.pdf.file ? "Cambiar PDF Costo" : "Subir PDF Costo"}</CardTitle>
										</CardHeaderChild>
										{(brandDocuments.pdf.url || brandDocuments.pdf.file) && <Button1 color="red" variant="solid" onClick={() => deleteDocumentInput("pdf")}>Eliminar</Button1>}
									</CardHeader>
									<CardBody>
										<span>Archivo PDF, DOC, DOCX o TXT - hasta 2MB</span>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												"min-h-32",
											)}>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 min-h-32'>
												<Icon
													icon='HeroDocumentText'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='pdf'
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
														<span>Subir PDF</span>
														<input
															id='pdf'
															name='pdf'
															type='file'
															className='sr-only brandPDFfInput'
															onChange={handleInputDocumentChange}
															accept='.pdf, .doc, .docx, .txt'
															multiple={false}
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PDF, DOC, DOCX o TXT - hasta 2MB
												</p>
											</div>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 min-h-32'>
												{
													(brandDocuments.pdf.file && <p className="w-full object-contain break-words px-8"> {brandDocuments.pdf.file?.name} </p>)
													||
													(brandDocuments.pdf.url && <p className="w-full object-contain break-words px-8"> {formik.values.pdfName} </p>)
												}
											</div>

										</div>
									</CardBody>
								</Card>	
							</div>
							<div className='col-span-12 lg:col-span-6'>
								<Card>
									<CardHeader className="content-between min-h-20">
										<CardHeaderChild >
											<CardTitle className='text-xl'>{brandDocuments.recommended_pdf.url || brandDocuments.recommended_pdf.file ? "Cambiar PDF Recomendado" : "Subir PDF Recomendado"}</CardTitle>
										</CardHeaderChild>
										{(brandDocuments.recommended_pdf.url || brandDocuments.recommended_pdf.file) && <Button1 color="red" variant="solid" onClick={() => deleteDocumentInput("recommended_pdf")}>Eliminar</Button1>}
									</CardHeader>
									<CardBody>
										<span>Archivo PDF, DOC, DOCX o TXT - hasta 2MB</span>
										<div
											className={classNames(
												'mt-2',
												'flex justify-center',
												'rounded-lg',
												'dark:border-zinc-500/50',
												"min-h-32",
											)}>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 min-h-32'>
												<Icon
													icon='HeroDocumentText'
													className='mx-auto h-12 w-12'
													color={themeConfig.themeColor}
													colorIntensity={themeConfig.themeColorShade}
												/>
												<div className='mt-4 flex text-sm leading-6 text-gray-500 '>
													<label
														htmlFor='recommended_pdf'
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
														<span>Subir PDF</span>
														<input
															id='recommended_pdf'
															name='recommended_pdf'
															type='file'
															className='sr-only recommendedPDFInput'
															onChange={handleInputDocumentChange}
															accept='.pdf, .doc, .docx, .txt'
															multiple={false}
														/>
													</label>
													<span className='pl-1'>o drag and drop</span>
												</div>
												<p className='text-xs leading-5 text-gray-500'>
													PDF, DOC, DOCX o TXT - hasta 2MB
												</p>
											</div>

											<div className='text-center dflex column w-1/2 border border-dashed border-zinc-500/25 min-h-32'>
												{
													(brandDocuments.recommended_pdf.file && <p className="w-full object-contain break-words px-8"> {brandDocuments.recommended_pdf.file?.name} </p>)
													||
													(brandDocuments.recommended_pdf.url && <p className="w-full object-contain break-words px-8"> {formik.values.pdfRecomendadoName} </p>)
												}
											</div>

										</div>
									</CardBody>
								</Card>
							</div>

							<div className='col-span-12'>
								<Card>
									<CardBody>
										<div className='flex flex-wrap divide-y divide-dashed divide-zinc-500/50 [&>*]:py-4'>
											<div className='flex basis-full gap-4'>
												<div className='flex grow items-center'>
													<Label htmlFor='weeklyNewsletter' className='!mb-0'>
														<div className='text-xl font-semibold'>
															Estado
														</div>
													</Label>
												</div>
												<CardHeaderChild>
													{formik.values.estado === "1" ? (
														<Badge
															variant='outline'
															className='border-transparent'
															color='emerald'>
															Habilitado
														</Badge>
													) : (
														<Badge
															variant='outline'
															className='border-transparent'
															color='red'>
															Deshabilitado
														</Badge>
													)}
													<Checkbox
														variant='switch'
														id='estado'
														name='estado'
														onChange={handleCheckChange}
														checked={formik.values.estado === "1"}
													/>
												</CardHeaderChild>
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

export default BrandPage;
