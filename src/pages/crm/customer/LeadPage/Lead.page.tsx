import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import "./lead.page.css";
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

import { Leads } from '../../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../../services/database';
import { showModal1 } from '../../../../features/modalSlice';
import { getDateFromDateNow, isFormChanged } from '../../../../utils/utils';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { validateEmail } from '../../../../utils/validations';

const LeadEditPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const { showSpinner } = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [leadData, setLeadData] = useState<Leads | null> (null);
	const initialData = useRef<Leads | object>({});

	const formik: FormikProps<Leads> = useFormik({
		initialValues: {
			id: 0,
			nombre: "",
			apellido: "",
			empresa: "",
			direccion: "",
			cp: "",
			ciudad: "",
			provincia: "",
			pais: "",
			telefono: "",
			email: "",
			celular: "",
			fecha_alta: 0,
			fecha_actualizacion: 0,
			referencia: "",
		},
		onSubmit: async (values: Leads) => {
			showSpinner(true);
			
			if (!validateEmail(values.email || "")) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "Email no válido"}}));
				return;
			}

			if (!isFormChanged(initialData.current, values)) {										//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({ show: true, info: { icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo" } }));
				showSpinner(false);
				return;
			}
			const response = await updateTable({ tableName: "leads", conditions: [{ field: "id", value: idParsed }], data: formik.values });
			if (response.success) {
				dispatch(showModal1({ show: true, info: { icon: "success", title: "Actualización exitosa", subtitle: "Lead actualizado correctamente" } }));
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
			
			const response = await getTable({ tableName: "leads", conditions: [{ field: "id", value: idParsed }] });
			if (response.success && response.data && response.data.length) {
				const reviewsData: Leads = response.data[0];
				setLeadData(reviewsData);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [idParsed])

	useEffect(() => {																										//Despues de leer la  base de datos actualizamos el estado de formik
		if (leadData) {
			formik.setValues(leadData);
			initialData.current = structuredClone(leadData);
		}
		// eslint-disable-next-line 
	}, [leadData])

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	return (
		<PageWrapper name="Edición de lead">
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
						Edición de lead
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
						<h1 className='my-4 font-bold text-center mr-10'>Edición de lead</h1>
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
													<p className='text-2xl font-semibold mb-0'>Datos del lead</p>
												</div>
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										<div className='grid grid-cols-12 gap-4 formFieldsMarginBottom'>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='nombre'>Nombre</Label>
												<Input
													id='nombre'
													name='nombre'
													onChange={formik.handleChange}
													value={formik.values.nombre}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='apellido'>Apellido</Label>
												<Input
													id='apellido'
													name='apellido'
													onChange={formik.handleChange}
													value={formik.values.apellido}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='empresa'>Empresa</Label>
												<Input
													id='empresa'
													name='empresa'
													onChange={formik.handleChange}
													value={formik.values.empresa}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='direccion'>Dirección</Label>
												<Input
													id='direccion'
													name='direccion'
													onChange={formik.handleChange}
													value={formik.values.direccion}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='cp'>CP</Label>
												<Input
													id='cp'
													name='cp'
													onChange={formik.handleChange}
													value={formik.values.cp}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='ciudad'>Ciudad</Label>
												<Input
													id='ciudad'
													name='ciudad'
													onChange={formik.handleChange}
													value={formik.values.ciudad}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='provincia'>Provincia</Label>
												<Input
													id='provincia'
													name='provincia'
													onChange={formik.handleChange}
													value={formik.values.provincia}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='pais'>País</Label>
												<Input
													id='pais'
													name='pais'
													onChange={formik.handleChange}
													value={formik.values.pais}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='telefono'>Teléfono</Label>
												<Input
													id='telefono'
													name='telefono'
													onChange={formik.handleChange}
													value={formik.values.telefono}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='email'>Email</Label>
												<Input
													id='email'
													name='email'
													onChange={formik.handleChange}
													value={formik.values.email}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='celular'>Celular</Label>
												<Input
													id='celular'
													name='celular'
													onChange={formik.handleChange}
													value={formik.values.celular}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='referencia'>Referencia</Label>
												<Input
													id='referencia'
													name='referencia'
													onChange={formik.handleChange}
													value={formik.values.referencia}
													type='text'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='fecha_alta'>Fecha de alta</Label>
												<Input
													id='fecha_alta'
													name='fecha_alta'
													value={getDateFromDateNow(formik.values.fecha_alta || 0)}
													type='text'
													readOnly
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='fecha_actualizacion'>Fecha de actualización</Label>
												<Input
													id='fecha_actualizacion'
													name='fecha_actualizacion'
													value={getDateFromDateNow(formik.values.fecha_actualizacion || 0)}
													type='text'
													readOnly
													className='ordersInputsInfo'
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

export default LeadEditPage;
