import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import "./review.page.css";
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

import { ReviewFormDataFromDB, Reviews } from '../../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../../services/database';
import { showModal1 } from '../../../../features/modalSlice';
import { reviewsEditFormRequiredFields } from '../../../../data';
import { getDateFromDateNow, isFormChanged } from '../../../../utils/utils';
import { SpinnerContext } from '../../../../context/spinnerContext';
import Select from '../../../../components/form/Select';
import Textarea from '../../../../components/form/Textarea';

const ReviewPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [reviewData, setReviewData] = useState<ReviewFormDataFromDB | null> (null);
	const initialData = useRef<ReviewFormDataFromDB | object>({});

	const formik: FormikProps<ReviewFormDataFromDB> = useFormik({
		initialValues: {
			id: 0,
			author_name: "",
			author_url: "",
			profile_photo_url: "",
			language: "0",
			rating: 5,
			text: "",
			time: 0,
			show: "0",
		},
		onSubmit: async (values: ReviewFormDataFromDB) => {
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			reviewsEditFormRequiredFields.forEach((requiredField) => {
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
			const response = await updateTable({ tableName: "reviews", conditions: [{ field: "id", value: idParsed }], data: formik.values });
			if (response.success) {
				dispatch(showModal1({ show: true, info: { icon: "success", title: "Actualización exitosa", subtitle: "Reseña actualizada correctamente" } }));
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
			
			const fields: (keyof Reviews)[] = ["id", "author_name", "author_url", "profile_photo_url", "language", "rating", "text", "time", "show"];
			const response = await getTable({ tableName: "reviews", conditions: [{ field: "id", value: idParsed }], fields });
			if (response.success && response.data && response.data.length) {
				const reviewsData: ReviewFormDataFromDB = response.data[0];
				setReviewData(reviewsData);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [idParsed])

	useEffect(() => {																										//Despues de leer la  base de datos actualizamos el estado de formik
		if (reviewData) {
			formik.setValues(reviewData);
			initialData.current = structuredClone(reviewData);
		}
		// eslint-disable-next-line 
	}, [reviewData])

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	return (
		<PageWrapper name="Edición de reseña">
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
						Edición de reseña
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
					<div className='col-span-12 dflex justify-start flex-wrap'>
						<h1 className='my-4 font-bold text-center mr-10'>Edición de Reseña</h1>
					</div>
					<div className='col-span-12 forNotebooks1366Page'>    {/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardBody>
										<div className='flex w-full gap-4'>
											<p className='w-full text-2xl font-bold mb-0'>
												<span className='text-base font-normal'>ID:</span> {idParsed}
											</p>
										</div>
									</CardBody>
								</Card>
							</div>
							<div className='col-span-12'>
								<Card>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle>
												<div>
													<p className='text-2xl font-semibold mb-0'>Información de la reseña</p>
													<div className='text-base font-normal text-zinc-500'>
														Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
													</div>
												</div>
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4 formFieldsMarginBottom'>
											<div className='col-span-12'>
												<Label htmlFor='id'>Imagen de perfil</Label>
												<img src={formik.values.profile_photo_url} alt="Author Avatar" className='w-24 h-24'/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='id'>ID</Label>
												<Input
													id='id'
													name='id'
													value={formik.values.id}
													type='number'
													readOnly={true}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='id'>Nombre del cliente</Label>
												<Input
													id='author_name'
													name='author_name'
													value={formik.values.author_name}
													type='text'
													readOnly={true}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='id'>Url</Label>
												<Input
													id='author_url'
													name='author_url'
													value={formik.values.author_url}
													type='text'
													readOnly={true}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='id'>Idioma</Label>
												<Input
													id='language'
													name='language'
													value={formik.values.language}
													type='text'
													readOnly={true}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='titulo'>Fecha</Label>
												<Input
													id='time'
													name='time'
													value={getDateFromDateNow(formik.values.time)}
													readOnly={true}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='carrousel'>Calificación<span className='requiredFieldSymbol'>*</span></Label>
												<Select
													name='rating'
													onChange={formik.handleChange}
													value={formik.values.rating.toString()}
												>
													<option key={5} value="5">
														5
													</option>
													<option key={4} value="4">
														4
													</option>
													<option key={3} value="3">
														3
													</option>
													<option key={2} value="2">
														2
													</option>
													<option key={1} value="1">
														1
													</option>
												</Select>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='carrousel'>Mostrar en sitio<span className='requiredFieldSymbol'>*</span></Label>
												<Select
													name='show'
													onChange={formik.handleChange}
													value={formik.values.show}
												>
													<option key={1} value="1">
														Si
													</option>
													<option key={2} value="0">
														No
													</option>
												</Select>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='titulo'>Reseña</Label>
												<Textarea
													id='text'
													name='text'
													value={formik.values.text}
													onChange={formik.handleChange}
													className='h-60'
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

export default ReviewPage;
