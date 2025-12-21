import { FormikProps, useFormik } from 'formik';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import Input from '../../../../components/form/Input';
import Label from '../../../../components/form/Label';
import Container from '../../../../components/layouts/Container/Container';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Button from '../../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import { showModal1 } from '../../../../features/modalSlice';
import './sellerNew.page.css';

import { SpinnerContext } from '../../../../context/spinnerContext';
import { sellerFormRequiredFields } from '../../../../data';
import useSaveBtn from '../../../../hooks/useSaveBtn';
import { insertRow } from '../../../../services/database';
import { Vendedor } from '../../../../types/DASHBOARD/database';
import { validateEmail } from '../../../../utils/validations';
import { sellerCodeExitst } from '../../../../utils/verifications';

const formikInitialValues: Partial<Vendedor> = {
	nombre: '',
};

const SellerNewPage = () => {
	const { showSpinner } = useContext(SpinnerContext);
	const dispatch = useDispatch();

	const formik: FormikProps<Partial<Vendedor>> = useFormik({
		initialValues: formikInitialValues,
		onSubmit: async (values: Partial<Vendedor>) => {
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = []; //Verifica si hay campos obligatorios vacíos
			sellerFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				}
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'error',
							title: 'Error',
							subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(', ')}`,
						},
					}),
				);
				return;
			}

			if (!validateEmail(values.email || '')) {
				showSpinner(false);
				dispatch(
					showModal1({
						show: true,
						info: { icon: 'error', title: 'Error', subtitle: 'Email no válido' },
					}),
				);
				return;
			}

			if (values.codigo) {
				const codeExistsData = await sellerCodeExitst(values.codigo);
				if (codeExistsData.success && codeExistsData.data) {
					showSpinner(false);
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'Error',
								subtitle: 'El código de vendedor ya existe',
							},
						}),
					);
					return;
				} else if (!codeExistsData.success) {
					showSpinner(false);
					dispatch(
						showModal1({
							show: true,
							info: {
								icon: 'error',
								title: 'Error al verificar código de vendedor',
								subtitle: codeExistsData.message,
							},
						}),
					);
					return;
				}
			}

			const response = await insertRow({ tableName: 'vendedor', data: formik.values });
			if (response.success) {
				formik.resetForm({
					values: formikInitialValues,
				});
				dispatch(
					showModal1({
						show: true,
						info: {
							icon: 'success',
							title: 'Acción exitosa',
							subtitle: 'Vendedor creado correctamente',
						},
					}),
				);
			} else {
				dispatch(
					showModal1({
						show: true,
						info: { icon: 'error', title: 'Error', subtitle: response.message },
					}),
				);
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
		<PageWrapper name='Añadir cliente'>
			<Subheader>
				<SubheaderLeft>
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
						<div className='cutomerJoyasPage_formColumn col-span-12 flex flex-col gap-4 xl:col-span-6'>
							<Card>
								<CardHeader>
									<CardHeaderChild>
										<CardTitle>
											<div>
												<div>Añadir vendedor</div>
												<div className='text-base font-normal text-zinc-500'>
													Los campos marcados con{' '}
													<span className='requiredFieldSymbol'>*</span>{' '}
													son obligatorios
												</div>
											</div>
										</CardTitle>
									</CardHeaderChild>
								</CardHeader>
								<CardBody>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>
											<Label htmlFor='nombre'>
												Nombre{' '}
												<span className='requiredFieldSymbol'>*</span>
											</Label>
											<Input
												id='nombre'
												name='nombre'
												value={formik.values.nombre}
												onChange={formik.handleChange}
												autoComplete='nombre'
												type='text'
											/>
										</div>
									</div>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>
											<Label htmlFor='email'>
												Email <span className='requiredFieldSymbol'>*</span>
											</Label>
											<Input
												id='email'
												name='email'
												value={formik.values.email}
												onChange={formik.handleChange}
												type='text'
											/>
										</div>
									</div>
									<div className='grid grid-cols-12 gap-4'>
										<div className='col-span-12'>
											<Label htmlFor='codigo'>Códido</Label>
											<Input
												id='codigo'
												name='codigo'
												value={formik.values.codigo}
												onChange={formik.handleChange}
												type='text'
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

export default SellerNewPage;
