import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../components/layouts/Subheader/Subheader';
import { appPages } from '../../../config/pages.config';
import Button from '../../../components/ui/Button';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/Input';
import Checkbox from '../../../components/form/Checkbox';
import Badge from '../../../components/ui/Badge';
import useSaveBtn from '../../../hooks/useSaveBtn';

import { Config } from '../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../services/database';
import { showModal1 } from '../../../features/modalSlice';
import { messagingSettingsRequiredFields } from '../../../data';
import { isFormChanged } from '../../../utils/utils';
import { SpinnerContext } from '../../../context/spinnerContext';
import Textarea from '../../../components/form/Textarea';
import { validateEmail } from '../../../utils/validations';

const MessagingsettingsPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const {showSpinner} = useContext(SpinnerContext);

	const isNewItem = id === 'new';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [userData, setUserData] = useState <Partial<Config> | null> (null);
	const initialData = useRef <Partial<Config> | object> ({});
		
	const formik: FormikProps <Partial<Config>> = useFormik({
		initialValues: {
			id: 0,
			seccion: "",
			asunto: "",
			destinatarios: "", 			//Rubro,
			respuesta: "",
			activo: "0",
		},
		onSubmit: async (values: Partial<Config>) => {	
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			messagingSettingsRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}`}}));
				return;
			};
					
			if (!isFormChanged(initialData.current, values)) {								//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({show: true, info: {icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo"}}));
				showSpinner(false);
				return;
			}
	
			const emailsDestinations = values.destinatarios?.split(";").map((destination) => destination.trim()).filter((destination) => destination);			//Se eliminan espacios en emails y emails iguales a string vacio ""
			if (emailsDestinations?.some((destinationEmail) => !validateEmail(destinationEmail || ""))) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "Email/s no válido/s"}}));
				return;
			}

			const response = await updateTable({tableName: "config", conditions: [{field: "id", value: idParsed}], data: formik.values});
			if (response.success) {
				dispatch(showModal1({show: true, info: {icon: "success", title: "Actualización exitosa", subtitle: "Notificación actualizada correctamente"}}));
				
				initialData.current = structuredClone(values);								//Guardamos los valores actualizados del formulario para volver a verificar cambios
			} else {
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: response.message}}));
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
							
			const response1 = await getTable ({tableName: "config", conditions: [{field: "id", value: idParsed}]});
			if (response1.success && response1.data && response1.data.length) {
				const data: Partial<Config> = response1.data[0];
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
		<PageWrapper name={formik.values.id?.toString()}>
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.messagingsettingsListPage.to}`}>
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
							Edición de notificación
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
				<div className='flex h-full flex-wrap content-start'>
					<div className='mb-4 grid w-full grid-cols-12 gap-4'>
						<div className='col-span-12 flex flex-col gap-4 xl:col-span-6 cutomerJoyasPage_formColumn'>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>{`Sección: ${formik.values.seccion}`}</div>
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
											<Label htmlFor='id'>ID</Label>
											<Input
												id='id'
												name='id'
												readOnly={true}
												value={idParsed}
												autoComplete='id'
											/>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='email'>Asunto <span className='requiredFieldSymbol'>*</span></Label>
											<Textarea
												id='asunto'
												name='asunto'
												onChange={formik.handleChange}
												value={formik.values.asunto ? formik.values.asunto : ""}				//El trim() es para que no se permitan espacios vacios en el email (al apretar la barra espaciadora no pasa nada)
												autoComplete='asunto'
											/>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='nombre'>Destinatarios separados por punto y coma (;). <span className='requiredFieldSymbol'>*</span> <br /> Ej.: direccion1@hotmail.com; direccion2@hotmail.com</Label>
											<Textarea
												id='destinatarios'
												name='destinatarios'
												onChange={formik.handleChange}
												value={formik.values.destinatarios}
												autoComplete='destinatarios'
											/>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='apellido'>Respuesta automática <span className='requiredFieldSymbol'>*</span></Label>
											<Textarea
												id='respuesta'
												name='respuesta'
												onChange={formik.handleChange}
												value={formik.values.respuesta}
												autoComplete='respuesta'
												rows={7}
											/>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardBody>
									<div className='flex flex-wrap divide-y divide-dashed divide-zinc-500/50 [&>*]:py-4'>
										<div className='flex basis-full gap-4'>
											<div className='flex grow items-center'>
												<Label htmlFor='weeklyNewsletter' className='!mb-0'>
													<div className='text-xl font-semibold'>
														Activo
													</div>
												</Label>
											</div>
											<CardHeaderChild>
												{formik.values.activo === "1" ? (
													<Badge
														variant='outline'
														className='border-transparent'
														color='emerald'>
														Si
													</Badge>
												) : (
													<Badge
														variant='outline'
														className='border-transparent'
														color='red'>
														No
													</Badge>
												)}
												<Checkbox
													variant='switch'
													id='activo'
													name='activo'
													onChange={handleCheckChange}
													checked={formik.values.activo === "1"}
												/>
											</CardHeaderChild>
										</div>
									</div>
								</CardBody>
							</Card>	
						</div>						
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default MessagingsettingsPage;
