import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import "./priceMultiplier.page.css";
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
import Select from '../../../../components/form/Select';
import Badge from '../../../../components/ui/Badge';
import useSaveBtn from '../../../../hooks/useSaveBtn';

import { Multiplicador, multiplicadorFieldsFromDB } from '../../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../../services/database';
import { showModal1 } from '../../../../features/modalSlice';
import { priceMultiplierFormRequiredFields } from '../../../../data';
import { isFormChanged } from '../../../../utils/utils';
import { SpinnerContext } from '../../../../context/spinnerContext';

const PriceMultiplierPage = () => {
	const { id } = useParams();
	const idParsed = id ? parseInt(id) || 0 : 0;
	const {showSpinner} = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = id === 'new';
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [userData, setUserData] = useState <Partial<Multiplicador> | null> (null);
	const initialData = useRef <Partial<Multiplicador> | object> ({});
		
	const formik: FormikProps <Partial<Multiplicador>> = useFormik({
		initialValues: {
			valor: 0,
			activo: "N",
		},
		onSubmit: async (values: Partial<Multiplicador>) => {	
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			priceMultiplierFormRequiredFields.forEach((requiredField) => {
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
			const response = await updateTable({tableName: "multiplicador", conditions: [{field: "id", value: 1}], data: {...formik.values}});
			if (response.success) {
				dispatch(showModal1({show: true, info: {icon: "success", title: "Actualización exitosa", subtitle: "Multiplicador de precios actualizado correctamente"}}));
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
			const response2 = await getTable ({tableName: "multiplicador", conditions: [{field: "id", value: 1}], fields: multiplicadorFieldsFromDB});
			if (response2.success && response2.data && response2.data.length) {
				const data: Partial<Multiplicador> = response2.data[0];
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
		<PageWrapper name="Multiplicador de precios">
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
							Multiplicador de Precios
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
												<div>Multiplicador de Precios</div>
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
											<Label htmlFor='id'>Valor general <span className='requiredFieldSymbol'>*</span></Label>
											<Input
												id='valor'
												name='valor'
												value={formik.values.valor}
												onChange={formik.handleChange}
												autoComplete='valor'
												type='number'
											/>
										</div>
										<div className='col-span-12'>
											<Label htmlFor='moneda'>Actualizar el precio de los grupos de precios <span className='requiredFieldSymbol'>*</span></Label>
											<Select
												name='activo'
												onChange={formik.handleChange}
												value={formik.values.activo}
											>
												<option key={2} value="Y">
													SI
												</option>
												<option key={3} value="N">
													NO
												</option>
											</Select>
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

export default PriceMultiplierPage;
