import "./leadNew.page.css";
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import { useDispatch } from "react-redux";
import { showModal1 } from "../../../../features/modalSlice";
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../../components/layouts/Container/Container';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/Input';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Button from '../../../../components/ui/Button';
import { appPages } from '../../../../config/pages.config';

import { SpinnerContext } from '../../../../context/spinnerContext';
import { insertRow } from '../../../../services/database';
import useSaveBtn from "../../../../hooks/useSaveBtn";
import { Leads } from "../../../../types/DASHBOARD/database";
import { validateEmail } from "../../../../utils/validations";

const formikInitialValues: Omit<Leads, "id"> = {
	nombre: "",
	apellido: "",
	email: "",
	telefono: "",
	direccion: "",
	ciudad: "",
	cp: "",
	pais: "",
	empresa: "",
	fecha_alta: Date.now() / 1000,
	fecha_actualizacion: Date.now() / 1000,
	celular: "",
	referencia: "",
	provincia: "",
};

const LeadNewPage = () => {

	const {showSpinner} = useContext(SpinnerContext);
	const dispatch = useDispatch();

	const formik: FormikProps <Omit<Leads, "id">> = useFormik({
		initialValues: formikInitialValues,
		onSubmit: async (values: Omit<Leads, "id">) => {
			showSpinner(true);
	
			if (!validateEmail(values.email || "")) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "Email no válido"}}));
				return;
			}
							
			const response = await insertRow({tableName: "leads", data: formik.values});
			if (response.success) {
				formik.resetForm({
					values: formikInitialValues
				});
				dispatch(showModal1({show: true, info: {icon: "success", title: "Acción exitosa", subtitle: "Lead agregado correctamente"}}));
			} else {
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: response.message}}));
			}
			showSpinner(false);
		},
	});	
						
	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem: true,
		isSaving: false,
		isDirty: formik.dirty,
	});
				
	return (
		<PageWrapper name="Añadir lead">
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.crmAppPages.subPages.customerPage.subPages.leadsListPage.to}`}>
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
			<Container className='flex shrink-0 grow basis-auto flex-col pb-0'>
				<div className='grid grid-cols-12 gap-4'>
					<div className='col-span-12 dflex justify-start flex-wrap'>
						<h1 className='my-4 font-bold text-center mr-10'>Añadir lead</h1>
					</div>
					<div className='col-span-12 forNotebooks1366Page'>    {/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
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

export default LeadNewPage;
