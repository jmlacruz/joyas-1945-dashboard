import "./shippingMethodNew.page.css";
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import { useDispatch } from "react-redux";
import { showModal1 } from "../../../features/modalSlice";
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/Input';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../components/layouts/Subheader/Subheader';
import Button from '../../../components/ui/Button';
import { appPages } from '../../../config/pages.config';

import { SpinnerContext } from '../../../context/spinnerContext';
import { insertRow } from '../../../services/database';
import { shippingMethodFormRequiredFields } from "../../../data";
import useSaveBtn from "../../../hooks/useSaveBtn";
import { Metodo_envio } from "../../../types/DASHBOARD/database";

const formikInitialValues: Partial<Metodo_envio> =  {
	nombre: "",
};

const ShippingMethodNewPage = () => {

	const {showSpinner} = useContext(SpinnerContext);
	const dispatch = useDispatch();

	const formik: FormikProps <Partial<Metodo_envio>> = useFormik({
		initialValues: formikInitialValues,
		onSubmit: async (values: Partial<Metodo_envio>) => {
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			shippingMethodFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}`}}));
				return;
			};
							
			const response = await insertRow({tableName: "metodo_envio", data: formik.values});
			if (response.success) {
				formik.resetForm({
					values: formikInitialValues
				});
				dispatch(showModal1({show: true, info: {icon: "success", title: "Actualización exitosa", subtitle: "Paño actualizado correctamente"}}));
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
		<PageWrapper name="Creación de paño">
			<Subheader>
				<SubheaderLeft>
					<Link
						to={`../${appPages.ordersAppPage.subPages.ordersPages.shippingMethodsListPage.to}`}>
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
				<div className='flex h-full flex-wrap content-start'>
					<div className='mb-4 grid w-full grid-cols-12 gap-4'>
						<div className='col-span-12 flex flex-col gap-4 xl:col-span-6 cutomerJoyasPage_formColumn'>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Creación de método de envío</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>
											<Label htmlFor='id'>Nombre <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='nombre'
												name='nombre'
												value={formik.values.nombre}
												onChange={formik.handleChange}
												autoComplete='nombre'
												type="text"
											/>
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

export default ShippingMethodNewPage ;
