import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Card, {
	CardBody,
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

import { System_config } from '../../../types/DASHBOARD/database';
import { getTable, updateTable } from '../../../services/database';
import { showModal1 } from '../../../features/modalSlice';
import { SpinnerContext } from '../../../context/spinnerContext';
import Textarea from '../../../components/form/Textarea';
import { isFormChanged } from '../../../utils/utils';

const GeneralSettingsPage = () => {

	const { showSpinner } = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = false;
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
	const [generalSettingsData, setGeneralSettingsData] = useState<System_config[]> ([]);
	const initialData = useRef<System_config[]> ([]);

	const saveData = async () => {
			showSpinner(true);

			if (!isFormChanged(initialData.current, generalSettingsData)) {											//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({ show: true, info: { icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo" } }));
				showSpinner(false);
				return;
			}

			if (generalSettingsData.some((setting) => setting.value.trim() === "")) {
				dispatch(showModal1({ show: true, info: { icon: "warning", title: "Ops!", subtitle: "No se pueden haber campos vacíos" } }));
				showSpinner(false);
				return;
			} ;

			const promises = generalSettingsData.map((setting) => updateTable({ tableName: "system_config", conditions: [{field: "id", value: setting.id}], data: {value: setting.value} }));

			const responses = await Promise.all(promises);
			if (responses.some((response) => !response.success)) {
				dispatch(showModal1({ show: true, info: { icon: "error", title: "Error", subtitle: "No se pudieron actualizar los datos" } }));
				showSpinner(false);
				return;
			}
			showSpinner(false);
			dispatch(showModal1({ show: true, info: { icon: "success", title: "Actualización exitosa", subtitle: "Configuración de sitio realizada correctamente" } }));
			initialData.current = structuredClone(generalSettingsData);												//Guardamos los valores actualizados del formulario para volver a verificar cambios
		};		


	useEffect(() => {
		(async () => {
			showSpinner(true);
				
			const response = await getTable({ tableName: "system_config"});
			if (response.success && response.data && response.data.length) {
				const settingsData: System_config[] = response.data;
				initialData.current = structuredClone(settingsData);
				setGeneralSettingsData(settingsData);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [])

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: true,
	});

	const getItemConfigData = (configName: string) => {
		const label = generalSettingsData?.find((item: System_config) => item.config === configName)?.label;
		const value = generalSettingsData?.find((item: System_config) => item.config === configName)?.value;
		return { label, value };
	};

	const handleInpuChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name: configName, value } = e.target;
		if (generalSettingsData) {
			const updatedData = generalSettingsData.map((item: System_config) => {
				if (item.config === configName) {
					return { ...item, value };
				}
				return item;
			});
			setGeneralSettingsData(updatedData);
		}
	};

	return (
		<PageWrapper name="Configuraciones generales">
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
						Configuraciones generales
					</Badge>
				</SubheaderLeft>
				<SubheaderRight>
					<Button
						icon='HeroServer'
						variant='solid'
						color={saveBtnColor}
						isDisable={saveBtnDisable}
						onClick={() => saveData()}>
						{saveBtnText}
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container className='flex shrink-0 grow basis-auto flex-col pb-0'>
				<div className='grid grid-cols-12 gap-4'>
					<div className='col-span-12 dflex justify-start flex-wrap'>
						<h1 className='my-4 font-bold text-center mr-10'>Configuraciones generales</h1>
					</div>
					<div className='col-span-12 forNotebooks1366Page'>    {/*Responsive para que se vea bien en notebooks de 1366x768px: linea original -> "<div className='col-span-12 lg:col-span-9'>"*/}
						<div className='grid grid-cols-12 gap-4'>
							<div className='col-span-12'>
								<Card>
									<CardBody>
										<div className='grid grid-cols-12 gap-4 formFieldsMarginBottom'>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='monto_minimo_pano_gratis'>{getItemConfigData("monto_minimo_pano_gratis").label}</Label>
												<Input
													id='monto_minimo_pano_gratis'
													name='monto_minimo_pano_gratis'
													value={getItemConfigData("monto_minimo_pano_gratis").value}
													type='text'
													onChange={handleInpuChange}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='numero_whatsapp'>{getItemConfigData("numero_whatsapp").label}</Label>
												<Input
													id='numero_whatsapp'
													name='numero_whatsapp'
													value={getItemConfigData("numero_whatsapp").value}
													type='text'
													onChange={handleInpuChange}
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12'>
												<Label htmlFor='banco_datos'>{getItemConfigData("banco_datos").label}</Label>
												<Textarea
													id='banco_datos'
													name='banco_datos'
													value={getItemConfigData("banco_datos").value}
													onChange={handleInpuChange}
													className='ordersInputsInfo min-h-72'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='costo_envio_ca_sin_pano'>{getItemConfigData("costo_envio_ca_sin_pano").label}</Label>
												<Input
													id='costo_envio_ca_sin_pano'
													name='costo_envio_ca_sin_pano'
													value={getItemConfigData("costo_envio_ca_sin_pano").value}
													onChange={handleInpuChange}
													type='text'
													className='ordersInputsInfo'
												/>
											</div>
											<div className='col-span-12 lg:col-span-6'>
												<Label htmlFor='costo_envio_ca_con_pano'>{getItemConfigData("costo_envio_ca_con_pano").label}</Label>
												<Input
													id='costo_envio_ca_con_pano'
													name='costo_envio_ca_con_pano'
													value={getItemConfigData("costo_envio_ca_con_pano").value}
													onChange={handleInpuChange}
													type='text'
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

export default GeneralSettingsPage;
