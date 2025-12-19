import { FormikProps, useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from '../../../../components/Avatar';
import Checkbox from '../../../../components/form/Checkbox';
import FieldWrap from '../../../../components/form/FieldWrap';
import Input from '../../../../components/form/Input';
import Label from '../../../../components/form/Label';
import Select from '../../../../components/form/Select';
import Icon from '../../../../components/icon/Icon';
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
	CardFooter,
	CardFooterChild,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import { appPages } from '../../../../config/pages.config';
import useSaveBtn from '../../../../hooks/useSaveBtn';
import "./customerJoyasNew.page.css";

import DateInput1 from '../../../../components/DASHBOARD/forms/dateInput1/DateInput1';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { rubrosList, usersFormRequiredFields } from '../../../../data';
import { showModal1 } from '../../../../features/modalSlice';
import { getTable, insertRow } from '../../../../services/database';
import { Rubro, Usuario, Vendedor } from '../../../../types/DASHBOARD/database';
import { convertDateFormat, getCurrentDateFormatted } from '../../../../utils/utils';
import { validateEmail } from '../../../../utils/validations';

const CustomerJoyasNewPage = () => {

	const { showSpinner } = useContext(SpinnerContext);
	const isNewItem = true;																			//Para que cambie el texto y color del boton superior de guardado
	const [isSaving] = useState<boolean>(false);
	const [dateSelected, setDateSelected] = useState("");
	const dispatch = useDispatch();

	const [sellersList, setSellerList] = useState<Partial<Usuario>[]>([]);
	const [passwordData, setPasswordData] = useState({
		password: "",
		repeatPassword: ""
	});

	const formik: FormikProps<Partial<Usuario>> = useFormik({
		initialValues: {
			nombre: "",
			apellido: "",
			empresa: "",
			rubro: "Revendedor" as Rubro,
			direccion: "",
			cp: "",
			ciudad: "",
			provincia: "",
			pais: "",
			telefono: "",
			email: "",
			permisos: "0" as "0" | "10",
			fecha_alta: "",
			newsletter: 0 as 0 | 1,
			habilitado: "0" as "0" | "1",
			celular: "",
			donde_conociste: "",
			habilitado_pdj: "0" as "0" | "1",
			iva: "CF" as "CF" | "MO" | "RI" | null,
			cuit: "" as number | string,
			razon: "",
			envio_nombre: "",
			envio_dni: "",
			envio_localidad: "",
			envio_provincia: "",
			envio_cp: "",
			envio_telefono: "",
			envio_direccion: "",
			vendedor: 0 as string | number,
		},
		onSubmit: async (values: Partial<Usuario>) => {
			showSpinner(true);

			if (!values.fecha_alta) values.fecha_alta = convertDateFormat(getCurrentDateFormatted());
			if (typeof values.cuit !== "number") values.cuit = 1;
			values.login = "";																						//Agregamos campos que no pueden ser null en el form
			values.codigo = "";
			values.token = "";

			values.password = passwordData.password;

			const emptyRequiredFieldsParsedArr: string[] = [];														//Verifica si hay campos obligatorios vacíos
			usersFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}` } }));
				return;
			};

			if (!validateEmail(values.email || "")) {
				showSpinner(false);
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: "Email no válido" } }));
				return;
			}

			if (
				passwordData.password &&
				passwordData.repeatPassword &&
				!passwordData.password.includes(" ") &&
				!passwordData.repeatPassword.includes(" ") &&
				passwordData.password === passwordData.repeatPassword &&
				passwordData.password.length >= 8
			) {
				const response = await insertRow({ tableName: "usuario", data: { ...values, password: passwordData.password } });
				if (response.success) {
					const newUserId = response.data;
					dispatch(showModal1({ show: true, info: { icon: "success", title: "Usuario creado", subtitle: `Se creó un nuevo usuario con ID: ${newUserId}` } }));
					formik.resetForm();
					passwordData.password = "";
					passwordData.repeatPassword = "";
					setDateSelected(getCurrentDateFormatted());
				} else {
					dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: `${response.message}` } }));
				}
			} else {
				dispatch(showModal1({ show: true, info: { icon: "warning", title: "Password Incorrecto", subtitle: "Los passwords deben ser iguales, tener 8 caracteres o más y no pueden contener espacios en blanco" } }));
			}
			showSpinner(false);
		}
	});

	const handleAdminPermissionChange = (e: React.ChangeEvent) => {
		const { name, checked } = e.target as HTMLInputElement;
		formik.setFieldValue(name, checked ? '10' : '0');
	};

	const handleCheckChange = (e: React.ChangeEvent) => {
		const { name, checked } = e.target as HTMLInputElement;
		formik.setFieldValue(name, checked ? '1' : '0');
	};

	const handleCheckChange2 = (e: React.ChangeEvent) => {
		const { name, checked } = e.target as HTMLInputElement;
		formik.setFieldValue(name, checked ? 1 : 0);
	};

	const handleIVAChange = (e: React.ChangeEvent) => {
		const { name, value } = e.target as HTMLSelectElement;
		formik.setFieldValue(name, value !== "empty" ? value : null);
	};

	const handleChangePassword = (e: React.ChangeEvent) => {
		const { name, value } = e.target as HTMLInputElement;
		setPasswordData((current) => ({ ...current, [name]: value }));
	};

	const handleDateChange = (dateStr: string) => {
		if (!dateStr) return;
		formik.setFieldValue("fecha_alta", convertDateFormat(dateStr));
	};

	// const [passwordShowStatus, setPasswordShowStatus] = useState<boolean>(false);
	const [passwordNewShowStatus, setPasswordNewShowStatus] = useState<boolean>(false);
	const [passwordNewConfShowStatus, setPasswordNewConfShowStatus] = useState<boolean>(false);

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

	useEffect(() => {
		(async () => {
			showSpinner(true);
			const response1 = await getTable({ tableName: "vendedor", fields: ["codigo", "nombre", "id"] });					//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			if (response1.success && response1.data && response1.data.length) {
				const sellersData: Vendedor[] = response1.data;
				setSellerList(sellersData);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [])

	return (
		<PageWrapper name={isNewItem ? 'New Customer' : formik.values.nombre}>
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.crmAppPages.subPages.customerPage.subPages.listPage.to}`}>
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
						Creación de usuario
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
								<CardBody>
									<div className='flex w-full gap-4'>
										<div className='flex-shrink-0'>
											<Avatar
												src={formik.values.permisos === "10" ? "/images/icons/admin.png" : "/images/icons/user.png"}
												className={`!w-24 ${formik.values.permisos === "10" ? "customAvatar_hue" : ""}`}
												name={`${formik.values.nombre} ${formik.values.apellido}`}
											/>
										</div>
										<div className='flex grow items-center'>
											<div>
												<div className='w-full text-2xl font-semibold'>
													{formik.values.nombre} {formik.values.apellido}
												</div>

												<div className='w-full text-zinc-500'>
													{formik.values.email}
												</div>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Información de usuario</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>   													{/*Linea original <div className='col-span-12 lg:col-span-6'>*/}
											<Label htmlFor='email'>Email <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='email'
												name='email'
												onChange={formik.handleChange}
												value={formik.values.email ? formik.values.email.trim() : ""}				//El trim() es para que no se permitan espacios vacios en el email (al apretar la barra espaciadora no pasa nada)
												autoComplete='email'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='nombre'>Nombre <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='nombre'
												name='nombre'
												onChange={formik.handleChange}
												value={formik.values.nombre}
												autoComplete='nombre'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='apellido'>Apellido <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='apellido'
												name='apellido'
												onChange={formik.handleChange}
												value={formik.values.apellido}
												autoComplete='apellido'
												autoCapitalize='words'
											/>
										</div>

										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='rubro'>Rubro</Label>
											<Select
												name='rubro'
												onChange={formik.handleChange}
												value={formik.values.rubro}
												placeholder='Seleccionar Rubro'>
												{rubrosList.map((role, index) => (
													<option key={index} value={role.value}>
														{role.text}
													</option>
												))}
											</Select>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='empresa'>Empresa</Label>
											<Input
												id='empresa'
												name='empresa'
												onChange={formik.handleChange}
												value={formik.values.empresa}
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='vendedor'>Vendedor <span className='requiredFieldSymbol'>*</span></Label>
											<Select
												name='vendedor'
												onChange={formik.handleChange}
												value={formik.values.vendedor}
												placeholder='Seleccionar Vendedor'>
												{sellersList.map((seller, index) => (
													<option key={index} value={seller.codigo}>
														{seller.nombre}
													</option>
												))}
											</Select>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='moneda'>Moneda <span className='requiredFieldSymbol'>*</span></Label>
											<Select
												name='moneda'
												// onChange={formik.handleChange}
												// value={formik.values.rubro}
												// placeholder='Seleccionar moneda'
												onChange={() => { }}
												defaultValue="ARS"
											>
												<option key={1} value="ARS">
													ARS
												</option>
												<option key={2} value="USD">
													USD
												</option>
											</Select>
										</div>
									</div>
								</CardBody>
							</Card>

							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Información de contacto</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='direccion'>Dirección</Label>
											<Input
												id='direccion'
												name='direccion'
												onChange={formik.handleChange}
												value={formik.values.direccion}
												autoComplete='direccion'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='cp'>CP</Label>
											<Input
												id='cp'
												name='cp'
												onChange={formik.handleChange}
												value={formik.values.cp}
												autoComplete='cp'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='ciudad'>Ciudad</Label>
											<Input
												id='ciudad'
												name='ciudad'
												onChange={formik.handleChange}
												value={formik.values.ciudad}
												autoComplete='ciudad'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='provincia'>Provincia <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='provincia'
												name='provincia'
												onChange={formik.handleChange}
												value={formik.values.provincia}
												autoComplete='provincia'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='pais'>País <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='pais'
												name='pais'
												onChange={formik.handleChange}
												value={formik.values.pais}
												autoComplete='pais'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='celular'>Celular</Label>
											<Input
												id='celular'
												name='celular'
												onChange={formik.handleChange}
												value={formik.values.celular}
												autoComplete='celular'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='telefono'>Teléfono <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='telefono'
												name='telefono'
												onChange={formik.handleChange}
												value={formik.values.telefono}
												autoComplete='telefono'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='donde_conociste'>Donde nos conociste</Label>
											<Input
												id='donde_conociste'
												name='donde_conociste'
												onChange={formik.handleChange}
												value={formik.values.donde_conociste}
												autoComplete='donde_conociste'
											/>
										</div>
									</div>
								</CardBody>
							</Card>

							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Contraseña</div>
												<div className='text-base font-normal text-zinc-500'>
													Complete los campos para crear una contraseña
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>
											<Label htmlFor='newPassword'>Password</Label>
											<FieldWrap
												lastSuffix={
													<Icon
														className='mx-2'
														icon={
															passwordNewShowStatus
																? 'HeroEyeSlash'
																: 'HeroEye'
														}
														onClick={() => {
															setPasswordNewShowStatus(
																!passwordNewShowStatus,
															);
														}}
													/>
												}>
												<Input
													type={
														passwordNewShowStatus ? 'text' : 'password'
													}
													id='password'
													name='password'
													onChange={handleChangePassword}
													value={passwordData.password.trim()}
													autoComplete='newPassword'
												/>
											</FieldWrap>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='repeatNewPassword'>
												Repetir password
											</Label>
											<FieldWrap
												lastSuffix={
													<Icon
														className='mx-2'
														icon={
															passwordNewConfShowStatus
																? 'HeroEyeSlash'
																: 'HeroEye'
														}
														onClick={() => {
															setPasswordNewConfShowStatus(
																!passwordNewConfShowStatus,
															);
														}}
													/>
												}>
												<Input
													type={
														passwordNewConfShowStatus
															? 'text'
															: 'password'
													}
													id='repeatPassword'
													name='repeatPassword'
													onChange={handleChangePassword}
													value={passwordData.repeatPassword.trim()}
													autoComplete='repeatNewPassword'
												/>
											</FieldWrap>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>

						<div className='col-span-12 flex flex-col gap-4 xl:col-span-6 cutomerJoyasPage_formColumn'>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>Permisos</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='flex flex-wrap divide-y divide-dashed divide-zinc-500/50 [&>*]:py-4'>
										<div className='flex basis-full gap-4'>
											<div className='flex grow items-center'>
												<Label htmlFor='weeklyNewsletter' className='!mb-0'>
													<div className='text-xl font-semibold'>
														Rol
													</div>
												</Label>
											</div>
											<CardHeaderChild>
												{formik.values.permisos === "10" ? (
													<Badge
														variant='outline'
														className='border-transparent'
														color='emerald'>
														Administrador
													</Badge>
												) : (
													<Badge
														variant='outline'
														className='border-transparent'
														color='red'>
														Usuario
													</Badge>
												)}
												<Checkbox
													variant='switch'
													id='permisos'
													name='permisos'
													onChange={handleAdminPermissionChange}
													checked={formik.values.permisos === "10"}
												/>
											</CardHeaderChild>
										</div>
										<div className='flex basis-full gap-4'>
											<div className='flex grow items-center'>
												<Label htmlFor='weeklyNewsletter' className='!mb-0'>
													<div className='text-xl font-semibold'>
														Habilitado
													</div>
												</Label>
											</div>
											<CardHeaderChild>
												{formik.values.habilitado === "1" ? (
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
													id='habilitado'
													name='habilitado'
													onChange={handleCheckChange}
													checked={formik.values.habilitado === "1"}
												/>
											</CardHeaderChild>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Información fiscal</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='cuit'>CUIT / DNI (Sin puntos ni guiones)</Label>
											<Input
												id='cuit'
												name='cuit'
												onChange={formik.handleChange}
												value={formik.values.cuit}
												autoComplete='cuit'
												type='number'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='razon'>Razon Social / Nombre completo</Label>
											<Input
												id='razon'
												name='razon'
												onChange={formik.handleChange}
												value={formik.values.razon}
												autoComplete='razon'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='iva'>Situación frente al IVA</Label>
											<Select
												name='iva'
												onChange={handleIVAChange}
												value={formik.values.iva !== null ? formik.values.iva : "empty"}
											>
												<option key="empty" value="empty">

												</option>
												<option key="CF" value="CF">
													CF
												</option>
												<option key="MO" value="MO">
													MO
												</option>
												<option key="RI" value="RI">
													RI
												</option>
											</Select>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Información de Envío</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_nombre'>Envío - Nombre y Apellido</Label>
											<Input
												id='envio_nombre'
												name='envio_nombre'
												onChange={formik.handleChange}
												value={formik.values.envio_nombre}
												autoComplete='envio_nombre'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_dni'>Envío - DNI</Label>
											<Input
												id='envio_dni'
												name='envio_dni'
												onChange={formik.handleChange}
												value={formik.values.envio_dni}
												autoComplete='envio_dni'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_direccion'>Envío - Dirección</Label>
											<Input
												id='envio_direccion'
												name='envio_direccion'
												onChange={formik.handleChange}
												value={formik.values.envio_direccion}
												autoComplete='envio_direccion'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_localidad'>Envío - Localidad</Label>
											<Input
												id='envio_localidad'
												name='envio_localidad'
												onChange={formik.handleChange}
												value={formik.values.envio_localidad}
												autoComplete='envio_localidad'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_provincia'>Envío - Provincia</Label>
											<Input
												id='envio_provincia'
												name='envio_provincia'
												onChange={formik.handleChange}
												value={formik.values.envio_provincia}
												autoComplete='envio_provincia'
												autoCapitalize='words'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_cp'>Envío - CP</Label>
											<Input
												id='envio_cp'
												name='envio_cp'
												onChange={formik.handleChange}
												value={formik.values.envio_cp}
												autoComplete='envio_cp'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='envio_telefono'>Envío - Teléfono</Label>
											<Input
												id='envio_telefono'
												name='envio_telefono'
												onChange={formik.handleChange}
												value={formik.values.envio_telefono}
												autoComplete='envio_telefono'
											/>
										</div>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='habilitado_pdj'>Habilitado PDJ <span className='requiredFieldSymbol'>*</span></Label>
											<Select
												name='habilitado_pdj'
												onChange={formik.handleChange}
												value={formik.values.habilitado_pdj}
												placeholder='Seleccionar Rubro'>
												<option key={1} value="1">
													Sí
												</option>
												<option key={2} value="0">
													No
												</option>
											</Select>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12 lg:col-span-6'>
											<Label htmlFor='fecha_alta' className='!text-base font-bold'>Fecha de alta <span className='requiredFieldSymbol'>*</span></Label>
											<DateInput1
												inputChangeFunction={handleDateChange}
												defaultValue={getCurrentDateFormatted()}
												setValue={dateSelected}
											/>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>Información adicional</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='flex flex-wrap divide-y divide-dashed divide-zinc-500/50 [&>*]:py-4'>
										<div className='flex basis-full gap-4'>
											<div className='flex grow items-center'>
												<Label htmlFor='weeklyNewsletter' className='!mb-0'>
													<div className='text-xl font-semibold'>
														Recibir novedades de Joyas 1945
													</div>
												</Label>
											</div>
											<div className='flex flex-shrink-0 items-center'>
												<Checkbox
													variant='switch'
													id='newsletter'
													name='newsletter'
													onChange={handleCheckChange2}
													checked={formik.values.newsletter === 1}
												/>
											</div>
										</div>
										<div className='flex basis-full gap-4'>
											<div className='flex grow items-center'>
												<Label htmlFor='lifecycleEmails' className='!mb-0'>
													<div className='text-xl font-semibold'>
														Joyas1945
													</div>
												</Label>
											</div>
											<div className='flex flex-shrink-0 items-center'>
												<Checkbox
													variant='switch'
													id='joyas1945'
													name='joyas1945'
													// onChange={formik.handleChange}
													// checked={true}
													// defaultChecked={false}
													readOnly
												/>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</div>
				<div className='flex'>
					<div className='grid w-full grid-cols-12 gap-4'>
						<div className='col-span-12'>
							<Card>
								<CardFooter /*className='cutomerJoyasPage_finalButtonCont'*/>
									<CardFooterChild>
										<div className='flex items-center gap-2'>
											<Icon icon='HeroUserCircle' size='text-2xl' color="blue" />
											<span className='text-zinc-500'>{formik.values.nombre} {formik.values.apellido} / </span>
											<b>{formik.values.email}</b>
										</div>
									</CardFooterChild>
									<CardFooterChild>
										<Button
											icon='HeroServer'
											variant='solid'
											color={saveBtnColor}
											isDisable={saveBtnDisable}
											onClick={() => formik.handleSubmit()}>
											{saveBtnText}
										</Button>
									</CardFooterChild>
								</CardFooter>
							</Card>
						</div>
					</div>
				</div>
			</Container>
		</PageWrapper>
	);
};

export default CustomerJoyasNewPage;
