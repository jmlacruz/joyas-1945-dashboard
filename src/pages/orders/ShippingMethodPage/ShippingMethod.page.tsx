import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import "./shippingMethod.page.css";
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
import Button from '../../../components/ui/Button';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/Input';
import Badge from '../../../components/ui/Badge';
import useSaveBtn from '../../../hooks/useSaveBtn';

import { Metodo_envio, shippingMethodFieldsFromDB } from '../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../services/database';
import { showModal1 } from '../../../features/modalSlice';
import { shippingMethodFormRequiredFields } from '../../../data';
import { isFormChanged } from '../../../utils/utils';
import { SpinnerContext } from '../../../context/spinnerContext';

const ShippingMethodPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const {showSpinner} = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [userData, setUserData] = useState <Metodo_envio | null> (null);
	const initialData = useRef <Metodo_envio | object> ({});
		
	const formik: FormikProps <Metodo_envio> = useFormik({
		initialValues: {
			id: 0,
			nombre: "",
		},
		onSubmit: async (values: Metodo_envio) => {	
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
				
			if (!isFormChanged(initialData.current, values)) {										//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({show: true, info: {icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo"}}));
				showSpinner(false);
				return;
			}
			const response = await updateTable({tableName: "metodo_envio", conditions: [{field: "id", value: idParsed}], data: formik.values});
			if (response.success) {
				dispatch(showModal1({show: true, info: {icon: "success", title: "Actualización exitosa", subtitle: "Método de envío actualizado correctamente"}}));
				initialData.current = structuredClone(values);										//Guardamos los valores actualizados del formulario para volver a verificar cambios
			} else {
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: response.message}}));
			}
			showSpinner(false);
		}
	});
	
	useEffect(() => {
		(async () => {
			showSpinner(true);
			const response2 = await getTable ({tableName: "metodo_envio", conditions: [{field: "id", value: idParsed}], fields: shippingMethodFieldsFromDB});
			if (response2.success && response2.data && response2.data.length) {
				const data: Metodo_envio = response2.data[0];
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
		<PageWrapper name="Edición de método de envío">
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
							Edición de método de envío
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
												<div>Edición de método de envío</div>
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
										<div className='col-span-12'>
											<Label htmlFor='nombre'>Nombre <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='nombre'
												name='nombre'
												value={formik.values.nombre}
												onChange={formik.handleChange}
												autoComplete='nombre'
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

export default ShippingMethodPage;
