import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import "./news.page.css";
import { Editor } from '@tinymce/tinymce-react';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../../components/layouts/Container/Container';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Button from '../../../../components/ui/Button';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/Input';
import Badge from '../../../../components/ui/Badge';
import useSaveBtn from '../../../../hooks/useSaveBtn';

import { Novedad, Producto } from '../../../../types/DASHBOARD/database';
import { getProductByID, getTable, updateTable } from '../../../../services/database';
import { showModal1 } from '../../../../features/modalSlice';
import { newsEditFormRequiredFields } from '../../../../data';
import { isFormChanged } from '../../../../utils/utils';
import { SpinnerContext } from '../../../../context/spinnerContext';
import Select from '../../../../components/form/Select';
import Icon from '../../../../components/icon/Icon';

const newsFieldsFromDB: (keyof Novedad)[] = ["id", "titulo", "subtitulo", "descripcion", "carrousel", "slug", "meta_title", "id_producto"];

const NewsPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);
	const navigate = useNavigate();
	const [productData, setProductData] = useState({
		name: "",
		id: 0,
	});

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [userData, setUserData] = useState<Partial<Novedad> | null>(null);
	const initialData = useRef<Partial<Novedad> | object>({});

	const formik: FormikProps<Partial<Novedad>> = useFormik({
		initialValues: {
			id: 0,
			titulo: "",
			subtitulo: "",
			descripcion: "",
			carrousel: "0",
			slug: "",
			meta_title: "",
		},
		onSubmit: async (values: Partial<Novedad>) => {
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			newsEditFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}` } }));
				return;
			};

			if (!isFormChanged(initialData.current, values)) {										//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({ show: true, info: { icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo" } }));
				showSpinner(false);
				return;
			}
			const response = await updateTable({ tableName: "novedad", conditions: [{ field: "id", value: idParsed }], data: formik.values });
			if (response.success) {
				dispatch(showModal1({ show: true, info: { icon: "success", title: "Actualización exitosa", subtitle: "Novedad actualizada correctamente" } }));
				initialData.current = structuredClone(values);										//Guardamos los valores actualizados del formulario para volver a verificar cambios
			} else {
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: response.message } }));
			}
			showSpinner(false);
		}
	});

	useEffect(() => {
		(async () => {
			showSpinner(true);
			const response2 = await getTable({ tableName: "novedad", conditions: [{ field: "id", value: idParsed }], fields: newsFieldsFromDB });
			if (response2.success && response2.data && response2.data.length) {
				const data: Novedad = response2.data[0];
				const response3 = await getProductByID(data.id_producto);
				if (response3.success && response3.data) {
					const prodData: Producto = response3.data[0];
					setProductData({
						name: prodData.nombre,
						id: prodData.id,
					});
				}
				setUserData(data);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [idParsed])

	useEffect(() => {																										//Despues de leer la  base de datos actualizamos el estado de formik
		if (userData) {
			formik.setValues(userData);
			initialData.current = structuredClone(userData);
		}
		// eslint-disable-next-line 
	}, [userData])

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	return (
		<PageWrapper name="Edición de novedad">
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
						Edición de novedad
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
			<Container className='flex shrink-0 grow basis-auto flex-col pb-0'>
				<div className='grid grid-cols-12 gap-4'>
					<div className='col-span-12 forNotebooks1366Page'>    {/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>
												<div>
													<div>Edición de novedad</div>
													<div className='text-base font-normal text-zinc-500 mb-6'>
														Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
													</div>

													<span className='text-sm font-normal'>Producto</span>
													<a className='flex' href={`/sales/product/${productData.id}`} target='_blank' rel='noreferrer'>
														<p className='mb-0 text-blue-500 text-lg font-medium'>{productData.name}</p>
														<Icon icon="HeroArrowTopRightOnSquare" color='blue' className='ml-2'></Icon>
													</a>
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
													value={formik.values.id}
													onChange={formik.handleChange}
													autoComplete='id'
													type='number'
													readOnly={true}
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='carrousel'>Mostrar en carrousel <span className='requiredFieldSymbol'>*</span></Label>
												<Select
													name='carrousel'
													onChange={formik.handleChange}
													value={formik.values.carrousel}
												>
													<option key={2} value="1">
														Si
													</option>
													<option key={3} value="0">
														No
													</option>
												</Select>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='titulo'>Título <span className='requiredFieldSymbol'>*</span> </Label>
												<Input
													id='titulo'
													name='titulo'
													value={formik.values.titulo}
													onChange={formik.handleChange}
													autoComplete='titulo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='subtitulo'>Subtítulo</Label>
												<Input
													id='subtitulo'
													name='subtitulo'
													value={formik.values.subtitulo}
													onChange={formik.handleChange}
													autoComplete='subtitulo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='slug'>URL Amigable <span className='requiredFieldSymbol'>*</span></Label>
												<Input
													id='slug'
													name='slug'
													value={formik.values.slug}
													onChange={formik.handleChange}
													autoComplete='slug'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='meta_title'>Meta Title</Label>
												<Input
													id='meta_title'
													name='meta_title'
													value={formik.values.meta_title}
													onChange={formik.handleChange}
													autoComplete='meta_title'
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='descripcion'>Descripción <span className='requiredFieldSymbol'>*</span></Label>
												<Editor
													apiKey='l4hfea0pjaiavvt3k2paws54oen95f3ghy2ofoy5rdyb9kbx'
													init={{
														plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
														toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
														tinycomments_mode: 'embedded',
														tinycomments_author: 'Author name',
														language: "es",
														spellchecker_language: 'es',
														spellchecker_active: true,
														mergetags_list: [
															{ value: 'First.Name', title: 'First Name' },
															{ value: 'Email', title: 'Email' },
														],
														ai_request: (_request: any, respondWith: any) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
													}}
													initialValue={formik.values.descripcion}
													onChange={(e) => formik.setFieldValue("descripcion", e.target.getContent())}
												/>
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

export default NewsPage;
