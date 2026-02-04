import {
	ColumnDef,
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from '../../../../components/layouts/Container/Container';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import { appPages } from '../../../../config/pages.config';
import { showModal1 } from '../../../../features/modalSlice';

import Input from '../../../../components/form/Input';
import Icon from '../../../../components/icon/Icon';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '../../../../components/layouts/Subheader/Subheader';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Tooltip from '../../../../components/ui/Tooltip';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';

import AvatarCustom from '../../../../components/DASHBOARD/avatar/Avatar';
import CheckBox1 from '../../../../components/DASHBOARD/checkBoxs/CheckBox1';
import FieldWrap from '../../../../components/form/FieldWrap';
import Label from '../../../../components/form/Label';
import Select from '../../../../components/form/Select';
import { Modal2Context } from '../../../../context/modal2Context';
import { SpinnerContext } from '../../../../context/spinnerContext';
import { rubrosList } from '../../../../data';
import { deleteRowByID, getTable, getUsersMetrics, updateTable } from '../../../../services/database';
import { enabledUserNotification } from '../../../../services/mails';
import { UsersListFilter } from '../../../../types/DASHBOARD';
import {
	Usuario,
	UsuarioListFieldsToTrim,
	UsuarioParsed,
	UsuarioParsedWithMetrics,
	Vendedor,
} from '../../../../types/DASHBOARD/database';
import {
	dateStringToLocaleFormat,
	getBreakPoint,
	insertDotsInPrice,
	isValidJSON,
	showElement,
} from '../../../../utils/utils';

const columnHelper = createColumnHelper<UsuarioParsedWithMetrics>();
const newUserLinkPage = `../${appPages.crmAppPages.subPages.customerPage.subPages.newUserPage.to}`;
const paginationInitialState: PaginationState = { pageIndex: 0, pageSize: 20 };

const applyFilter = (data: {
	filter: UsersListFilter;
	usersInitialData: UsuarioParsedWithMetrics[];
	setData: React.Dispatch<React.SetStateAction<UsuarioParsedWithMetrics[] | null>>;
}) => {
	const { filter, usersInitialData, setData } = data;
	let dataFiltered: UsuarioParsedWithMetrics[] = structuredClone(usersInitialData);

	if (filter.id) dataFiltered = dataFiltered.filter((user) => user.id === parseInt(filter.id)); //.normalize("NFD").replace(/[\u0300-\u036f]/g, "") saca tildes
	if (filter.password)
		dataFiltered = dataFiltered.filter((user) =>
			user.password?.toLowerCase().includes(filter.password.toLowerCase().trim()),
		); //replace(/\s+/g, " ") reemplaza espacios en blanco multiples por un solo espacio en blanco (ya que si el nombre en la base de datos tiene algun espacio multiple entre palabras y nuestra frase de busqueda tiene solo espacios simples no habrá resultados de busqueda)
	if (filter.nombre)
		dataFiltered = dataFiltered.filter((user) =>
			user.nombre
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.nombre
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.apellido)
		dataFiltered = dataFiltered.filter((user) =>
			user.apellido
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.apellido
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.empresa)
		dataFiltered = dataFiltered.filter((user) =>
			user.empresa
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.empresa
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.vendedor)
		dataFiltered = dataFiltered.filter((user) => user.vendedor === filter.vendedor);
	if (filter.rubro)
		dataFiltered = dataFiltered.filter(
			(user) => user.rubro?.toLowerCase() === filter.rubro.toLowerCase(),
		);
	if (filter.direccion)
		dataFiltered = dataFiltered.filter((user) =>
			user.direccion
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.direccion
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.cp)
		dataFiltered = dataFiltered.filter((user) =>
			user.cp?.toLowerCase().trim().includes(filter.cp.toLowerCase().trim()),
		);
	if (filter.ciudad)
		dataFiltered = dataFiltered.filter((user) =>
			user.ciudad
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.ciudad
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.provincia)
		dataFiltered = dataFiltered.filter((user) =>
			user.provincia
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.provincia
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.pais)
		dataFiltered = dataFiltered.filter((user) =>
			user.pais
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.pais
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.celular)
		dataFiltered = dataFiltered.filter((user) =>
			user.celular
				?.toLowerCase()
				.trim()
				.replace(/[^+\d]/g, '')
				.includes(
					filter.celular
						.toLowerCase()
						.trim()
						.replace(/[^+\d]/g, ''),
				),
		); //replace(/[^+\d]/g, "") Saca espacios en blanco dentro del string ya sean simples o multiples y cualquier caracter no numerico excepto el "+"
	if (filter.telefono)
		dataFiltered = dataFiltered.filter((user) =>
			user.telefono
				?.toLowerCase()
				.trim()
				.replace(/[^+\d]/g, '')
				.includes(
					filter.telefono
						.toLowerCase()
						.trim()
						.replace(/[^+\d]/g, ''),
				),
		);
	if (filter.donde_conociste)
		dataFiltered = dataFiltered.filter((user) =>
			user.donde_conociste
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, ' ')
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.donde_conociste
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.email)
		dataFiltered = dataFiltered.filter((user) =>
			user.email
				?.toLowerCase()
				.trim()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.includes(
					filter.email
						.toLowerCase()
						.trim()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ''),
				),
		);
	if (filter.permisos)
		dataFiltered = dataFiltered.filter((user) => user.permisos === filter.permisos);
	if (filter.fecha_alta) {
		const datefromInput = filter.fecha_alta; //Viene en formato yyyy-mm-dd
		const [y, m, d] = datefromInput.split('-');
		const dateFromInputParsed = `${d}-${m}-${y}`;
		dataFiltered = dataFiltered.filter(
			(product) => dateStringToLocaleFormat(product.fecha_alta) === dateFromInputParsed,
		);
	}
	if (filter.habilitado)
		dataFiltered = dataFiltered.filter((user) => user.habilitado === filter.habilitado);
	if (filter.newsletter)
		dataFiltered = dataFiltered.filter(
			(user) => user.newsletter === parseInt(filter.newsletter),
		);
	if (filter.habilitado_pdj)
		dataFiltered = dataFiltered.filter((user) => user.habilitado_pdj === filter.habilitado_pdj);

	setData(dataFiltered);
};

const filterClearValues = {
	id: '',
	password: '',
	nombre: '',
	apellido: '',
	empresa: '',
	vendedor: '',
	rubro: '',
	direccion: '',
	cp: '',
	ciudad: '',
	provincia: '',
	pais: '',
	celular: '',
	telefono: '',
	donde_conociste: '',
	email: '',
	permisos: '',
	fecha_alta: '',
	habilitado: '',
	newsletter: '',
	habilitado_pdj: '',
};

const CustomerJoyasListPage = () => {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: true }]);
	const [globalFilter, setGlobalFilter] = useState<string>('');

	const [data, setData] = useState<UsuarioParsedWithMetrics[] | null>(null);
	const initialData = useRef<UsuarioParsedWithMetrics[] | null>(null);
	const { showSpinner } = useContext(SpinnerContext);
	const { setModal2 } = useContext(Modal2Context);
	const dispatch = useDispatch();
	const firstRender = useRef(true);
	const firstRenderForSaveFilter = useRef(true);
	const navigate = useNavigate();
	const thisLocation = useLocation();

	const [filter, setFilter] = useState<UsersListFilter>(filterClearValues);
	const [filterData, setFilterData] = useState<{ sellersList: Vendedor[] }>({
		sellersList: [],
	});
	const [showFilters, setShowFilters] = useState(false);

	const handleShowFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			filtersCont.style.transitionDuration = '0.5s';
			if (filtersCont.style.maxHeight === '' || filtersCont.style.maxHeight === '0px') {
				setShowFilters(true);
				filtersCont.style.maxHeight = filtersCont.scrollHeight + 'px';
				localStorage.setItem('usersListShowFilters', JSON.stringify(true));
			} else {
				setShowFilters(false);
				filtersCont.style.maxHeight = '0px';
				localStorage.setItem('usersListShowFilters', JSON.stringify(false));
			}
		}
	};

	const openFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(true);
			filtersCont.style.transitionDuration = '0s';
			filtersCont.style.maxHeight = filtersCont.scrollHeight + 'px';
		}
	};

	const closeFilters = () => {
		const filtersCont = document.querySelector(
			'.productsList_filter_mainCont',
		) as HTMLDivElement;
		if (filtersCont) {
			setShowFilters(false);
			filtersCont.style.transitionDuration = '0s';
			filtersCont.style.maxHeight = '0px';
		}
	};

	const resetFilter = () => {
		setFilter(filterClearValues);
		applyFilter({
			filter: filterClearValues,
			usersInitialData: initialData.current || [],
			setData,
		});
		navigate(thisLocation.pathname); //Borra querys de la url
	};

	const enableUser = async (enabled: boolean, userData: Usuario) => {
		//Función que se le pasa al check de habilitar usuario en la tabla de usuarios (para habilitar o deshabilitar un usuario)
		const response = await updateTable({
			tableName: 'usuario',
			conditions: [{ field: 'id', value: userData.id }],
			data: { habilitado: enabled ? '1' : '0' },
		});
		if (response.success) {
			if (enabled) {
				const response2 = await enabledUserNotification({
					email: userData.email,
					name: userData.nombre,
					lastName: userData.apellido || '',
				});
				if (!response2.success) {
					dispatch(
						showModal1({
							show: true,
							info: {
								title: 'Acción no completada',
								subtitle: `Cuenta de usuario: ${userData.email} habilitada. Se produjo un error al notificar al usuario ${response2.message}`,
								icon: 'error',
							},
						}),
					);
				}
			}
		} else {
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Error',
						subtitle: `No se pudo ${enabled ? ' habilitar' : ' deshabilitar'} al usuario: ${response.message}`,
						icon: 'error',
					},
				}),
			);
		}
	};

	const deleteUserFunc = async (options: { userID: number; userEmail: string }) => {
		showSpinner(true);

		const { userEmail, userID } = options;

		const response = await deleteRowByID({ tableName: 'usuario', rowID: userID });
		if (response.success && response.data >= 1) {
			setData((current) => {
				if (current) {
					const usersFiltered = current.filter((user) => user.id !== userID);
					initialData.current = usersFiltered;
					return usersFiltered;
				} else {
					return [];
				}
			});
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'Acción completada',
						subtitle: `Se eliminó el usuario ${userEmail}`,
						icon: 'success',
					},
				}),
			);
		} else if (response.success && response.data === 0) {
			//Si no se eliminó ninguna fila la base devuelve 0
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'No se pudo eliminar el usuario',
						subtitle: 'Usuario no encontrado en la base de datos',
						icon: 'error',
					},
				}),
			);
			showSpinner(false);
		} else {
			dispatch(
				showModal1({
					show: true,
					info: {
						title: 'No se pudo eliminar el usuario. Intente nuevamente',
						subtitle: response.message,
						icon: 'error',
					},
				}),
			);
			showSpinner(false);
		}
	};

	const warningFordeleteUserFunction = (userID: number, userEmail: string) =>
		setModal2({
			show: true,
			title: 'Eliminación de usuario',
			icon: 'warning',
			subtitle: `Se eliminará el usuario: ${userEmail}. Desea continuar?`,
			firstButtonText: 'Cancelar',
			secondButtonText: 'Confirmar',
			firstButtonFunction: () => setModal2({ show: false }),
			secondButtonFunction: () => {
				setModal2({ show: false });
				deleteUserFunc({ userID, userEmail });
			},
		});

	const columns = useMemo<ColumnDef<UsuarioParsedWithMetrics, any>[]>(
		() => [
			columnHelper.accessor('permisos', {
				cell: (info) => (
					<Tooltip text={info.getValue()} className='tooltipCustom'>
						<div className='dflex'>
							<AvatarCustom
								src={
									info.getValue() === 'Administrador'
										? '/images/icons/admin.png'
										: '/images/icons/user.png'
								}
								name={`${info.row.original.nombre} ${info.row.original.apellido}`}
								className={`!aspect-[1/1] ${info.getValue() === 'Administrador' ? 'customAvatar_hue !w-9' : '!w-8'} !object-contain`}
								rounded='rounded'
							/>
						</div>
					</Tooltip>
				),
				header: 'Rol',
				footer: 'Rol',
				id: 'permisos',
			}),
			columnHelper.accessor('id', {
				cell: (info) => <span>{info.getValue()}</span>,
				header: 'ID',
				footer: 'ID',
				id: 'id',
			}),
			columnHelper.accessor('email', {
				cell: (info) => (
					<div className='flex' style={{ alignItems: 'baseline' }}>
						{info.getValue()}
						{info.row.original.habilitado === '1' ? (
							<Tooltip text='Habilitado'>
								<Icon icon='HeroCheckBadge' color='emerald' size='text-2xl' />
							</Tooltip>
						) : (
							<Tooltip text='Inhabilitado'>
								<Icon icon='HeroXCircle' color='red' size='text-2xl' />
							</Tooltip>
						)}
					</div>
				),
				header: 'Email',
				footer: 'Email',
				id: 'email',
			}),
			columnHelper.accessor('nombre', {
				cell: (info) => (
					<div
						className='font-bold'
						style={{
							textTransform: 'capitalize',
						}}>{`${info.row.original.nombre}`}</div>
				),
				header: 'Nombre',
				footer: 'Nombre',
				id: 'nombre',
			}),
			columnHelper.accessor('apellido', {
				cell: (info) => (
					<div
						className='font-bold'
						style={{
							textTransform: 'capitalize',
						}}>{`${info.row.original.apellido}`}</div>
				),
				header: 'Apellido',
				footer: 'Apellido',
				id: 'apellido',
			}),
			columnHelper.accessor('provincia', {
				cell: (info) => (
					<span style={{ textTransform: 'capitalize' }}>{info.getValue()}</span>
				),
				header: 'Provincia',
				footer: 'Provincia',
				id: 'provincia',
			}),
			columnHelper.accessor('ciudad', {
				cell: (info) => (
					<span style={{ textTransform: 'capitalize' }}>{info.getValue()}</span>
				),
				header: 'Ciudad',
				footer: 'Ciudad',
				id: 'ciudad',
			}),
		columnHelper.accessor('rubro', {
			cell: (info) => (
				<span style={{ textTransform: 'capitalize' }}>{info.getValue()}</span>
			),
			header: 'Rubro',
			footer: 'Rubro',
			id: 'rubro',
		}),
		columnHelper.accessor('ingresos', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Ingresos',
			footer: 'Ingresos',
			id: 'ingresos',
		}),
		columnHelper.accessor('pedidos', {
			cell: (info) => <span>{info.getValue()}</span>,
			header: 'Compras',
			footer: 'Compras',
			id: 'pedidos',
		}),
		columnHelper.accessor('monto', {
			cell: (info) => <span>${insertDotsInPrice(info.getValue())}</span>,
			header: 'Total gastado',
			footer: 'Total gastado',
			id: 'monto',
		}),

		columnHelper.accessor('habilitado', {
				cell: (info) => (
					<Tooltip text={info.getValue() === '1' ? 'Habilitado' : 'Deshabilitado'}>
						<div className='dflex wh100 justify-start'>
							<CheckBox1
								text=''
								checkedFunction={enableUser}
								dataInput={info.row.original}
								defaultValue={info.getValue() === '1'}
							/>
						</div>
					</Tooltip>
				),
				header: getBreakPoint() ? '✓' : 'Habilitado',
				footer: getBreakPoint() ? '✓' : 'Habilitado',
				id: 'habilitado',
			}),
			columnHelper.accessor('id', {
				cell: (info) => (
					<Link className='dflex wh100' to={`/crm/customer/${info.getValue()}`}>
						<Tooltip text='Modificar Usuario'>
							<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
						</Tooltip>
					</Link>
				),
				header: '',
				footer: '',
				enableSorting: false,
				id: 'id2',
			}),
			columnHelper.accessor('id', {
				cell: (info) => (
					<div
						className='dflex wh100'
						onClick={() =>
							warningFordeleteUserFunction(
								info.row.original.id,
								info.row.original.email,
							)
						}>
						<Tooltip text='Eliminar Usuario'>
							<Icon
								icon='HeroTrash'
								color='red'
								size='text-3xl'
								className='trashIconRed'
							/>
						</Tooltip>
					</div>
				),
				header: '',
				footer: '',
				enableSorting: false,
				id: 'id3',
			}),
		],
		//eslint-disable-next-line
		[columnHelper],
	);

	const table = useReactTable({
		data: data || [],
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		enableGlobalFilter: true,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: paginationInitialState,
		},
		// debugTable: true,
	});

	useEffect(() => {
		//Leemos la base de datos

		if (firstRender.current) {
			//Activamos el spinner solo al entrar en la pagina
			firstRender.current = false;
			showSpinner(true);
		}

		const fieldsUsersList: Array<keyof Partial<Usuario>> = [
			'email',
			'permisos',
			'nombre',
			'apellido',
			'habilitado',
			'id',
			'provincia',
			'ciudad',
			'rubro',
			'vendedor',
			'password',
			'empresa',
			'direccion',
			'cp',
			'pais',
			'celular',
			'telefono',
			'donde_conociste',
			'fecha_alta',
			'newsletter',
			'habilitado_pdj',
		];
		const fieldsToTrim: Array<keyof UsuarioListFieldsToTrim> = [
			'nombre',
			'apellido',
			'provincia',
			'ciudad',
			'email',
		];

		(async () => {
			const response1 = await getTable({
				tableName: 'vendedor',
				fields: ['codigo', 'nombre', 'id'],
			}); //Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			const sellersData: Vendedor[] = response1.data;
			setFilterData((current) => ({
				...current,
				sellersList: sellersData,
			}));

			const response2 = await getTable({
				tableName: 'usuario',
				fields: fieldsUsersList,
			});

			if (response2.success && response2.data && response2.data.length) {
				const usersData: Usuario[] = response2.data;

				const usersDataParsed: UsuarioParsed[] = usersData.map((user) => {
					//Parseamos el objeto que viene de la base modificando los campos
					return {
						...user,
						permisos: user.permisos === '10' ? 'Administrador' : 'Usuario',
					};
				});

				const usersDataWithSellerName: UsuarioParsed[] = usersDataParsed.map((user) => {
					//Remplaza el codigo de vendedor por su nombre
					const sellerData = sellersData.find(
						(seller) => seller.codigo === user.vendedor.toString(),
					);
					return {
						...user,
						vendedor: sellerData?.nombre || '',
					};
				});
				fieldsToTrim.forEach((field) => {
					//Trim de los campos string ya que algunos en la base de datos empiezan con espacio y se listan alfabeticamente mal
					usersDataWithSellerName.forEach((user) => {
						user[field] = user[field].trim();
					});
				});

				// Fetch metrics for all users in a single batch call
				const userIds = usersDataWithSellerName.map((user) => user.id);
				const metricsMap = await getUsersMetrics(userIds);

				// Merge metrics into user data, defaulting to 0 if not found
				const usersDataWithMetrics: UsuarioParsedWithMetrics[] =
					usersDataWithSellerName.map((user) => {
						const metrics = metricsMap[user.id] || {
							ingresos: 0,
							pedidos: 0,
							monto: 0,
						};
						return {
							...user,
							ingresos: metrics.ingresos,
							pedidos: metrics.pedidos,
							monto: metrics.monto,
						};
					});

				initialData.current = usersDataWithMetrics;

				const usersListShowFiltersJSON = localStorage.getItem('usersListShowFilters');
				const usersListShowFiltersOBJ =
					usersListShowFiltersJSON && isValidJSON(usersListShowFiltersJSON)
						? JSON.parse(usersListShowFiltersJSON)
						: null;
				usersListShowFiltersOBJ ? openFilters() : closeFilters();

				const savedFilterJSON = localStorage.getItem('usersListFilter');
				const savedFilterOBJ: UsersListFilter =
					savedFilterJSON && isValidJSON(savedFilterJSON)
						? JSON.parse(savedFilterJSON)
						: null;
				if (savedFilterOBJ) {
					setFilter(savedFilterOBJ);
					applyFilter({
						filter: savedFilterOBJ,
						usersInitialData: initialData.current || [],
						setData,
					});
				} else {
					applyFilter({ filter, usersInitialData: initialData.current || [], setData });
				}
			} else {
				dispatch(
					showModal1({
						show: true,
						info: {
							title: 'Error al renderizar la tabla',
							subtitle: response1.message,
							icon: 'error',
						},
					}),
				);
				showSpinner(false);
			}
		})();
		//eslint-disable-next-line
	}, [thisLocation]);

	useEffect(() => {
		if (!data) return;

		showSpinner(false);
		showElement(data && data.length >= 0); //Para que no aparezca la tabla vacia al cargar la página, mostramos la tabla una vez que se cargan los datos

		//eslint-disable-next-line
	}, [data]);

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
		const { name, value } = e.target;
		setFilter((current) => ({
			...current,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (firstRenderForSaveFilter.current) {
			//Con el primer render salimos para que no se cargue en el filtro guardado los valores limpios
			firstRenderForSaveFilter.current = false;
			return;
		}

		localStorage.setItem('usersListFilter', JSON.stringify(filter)); //Cada vez que se modifica el filtro lo guardamos en el localstorage
	}, [filter]);

	return (
		<PageWrapper name='Listado de usuarios' className='elementToShow'>
			<Subheader className='productsList_header_cont'>
				<SubheaderLeft>
					<FieldWrap
						firstSuffix={<Icon className='mx-2' icon='HeroMagnifyingGlass' />}
						lastSuffix={
							globalFilter && (
								<Icon
									icon='HeroXMark'
									color='red'
									className='mx-2 cursor-pointer'
									onClick={() => {
										setGlobalFilter('');
									}}
								/>
							)
						}>
						<Input
							id='example'
							name='example'
							placeholder='Buscar...'
							value={globalFilter ?? ''}
							onChange={(e) => {
								table.initialState.pagination = {
									...table.getState().pagination,
									pageIndex: 0,
								}; //Al buscar con el filtro volvemos a la pagina inicial
								setGlobalFilter(e.target.value);
							}}
						/>
					</FieldWrap>
					<Button
						variant='solid'
						icon='HeroFunnel'
						color='emerald'
						onClick={handleShowFilters}
						className='productsList_filter_search_button mr-4'>
						{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
					</Button>
				</SubheaderLeft>
				<SubheaderRight>
					<Link to={newUserLinkPage}>
						<Button variant='solid' icon='HeroPlus'>
							Crear usuario
						</Button>
					</Link>
				</SubheaderRight>
			</Subheader>
			<Container className='productsList_filter_mainCont my-4 py-0'>
				<div className='productsList_filter_cont dflex wrap rounded-xl p-4'>
					<div>
						<Label htmlFor='id'>ID</Label>
						<Input
							id='id'
							name='id'
							value={filter.id}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>Contraseña</Label>
						<Input
							id='password'
							name='password'
							value={filter.password}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>Nombre</Label>
						<Input
							id='nombre'
							name='nombre'
							value={filter.nombre}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>Apellido</Label>
						<Input
							id='apellido'
							name='apellido'
							value={filter.apellido}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>Empresa</Label>
						<Input
							id='empresa'
							name='empresa'
							value={filter.empresa}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='id'>Vendedor</Label>
						<Select
							name='vendedor'
							onChange={handleFilterChange}
							value={filter.vendedor}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							{filterData.sellersList.map((seller, index) => (
								<option key={index + 1} value={seller.nombre}>
									{seller.nombre}
								</option>
							))}
						</Select>
					</div>
					<div>
						<Label htmlFor='rubro'>Rubro</Label>
						<Select
							name='rubro'
							onChange={handleFilterChange}
							value={filter.rubro}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							{rubrosList.map((rubro, index) => (
								<option key={index + 1} value={rubro.value}>
									{rubro.text}
								</option>
							))}
						</Select>
					</div>
					<div>
						<Label htmlFor='password'>Dirección</Label>
						<Input
							id='direccion'
							name='direccion'
							value={filter.direccion}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='password'>CP</Label>
						<Input
							id='cp'
							name='cp'
							value={filter.cp}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Ciudad</Label>
						<Input
							id='ciudad'
							name='ciudad'
							value={filter.ciudad}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Provincia</Label>
						<Input
							id='provincia'
							name='provincia'
							value={filter.provincia}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>País</Label>
						<Input
							id='pais'
							name='pais'
							value={filter.pais}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Celular</Label>
						<Input
							id='celular'
							name='celular'
							value={filter.celular}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Teléfono</Label>
						<Input
							id='telefono'
							name='telefono'
							value={filter.telefono}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Dónde nos conociste</Label>
						<Input
							id='donde_conociste'
							name='donde_conociste'
							value={filter.donde_conociste}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='ciudad'>Email</Label>
						<Input
							id='email'
							name='email'
							value={filter.email}
							onChange={handleFilterChange}
							type='text'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='rubro'>Permisos</Label>
						<Select
							name='permisos'
							onChange={handleFilterChange}
							value={filter.permisos}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							<option key={1} value='Usuario'>
								Usuario
							</option>
							<option key={2} value='Administrador'>
								Administrador
							</option>
						</Select>
					</div>

					<div>
						<Label htmlFor='fecha_alta'>Fecha de alta</Label>
						<Input
							id='fecha_alta'
							name='fecha_alta'
							value={filter.fecha_alta}
							onChange={handleFilterChange}
							type='date'
							className='productsListInputOrSelect'
						/>
					</div>
					<div>
						<Label htmlFor='rubro'>Habilitado</Label>
						<Select
							name='habilitado'
							onChange={handleFilterChange}
							value={filter.habilitado}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							<option key={1} value='1'>
								Sí
							</option>
							<option key={2} value='0'>
								No
							</option>
						</Select>
					</div>
					<div>
						<Label htmlFor='rubro'>Recibir novedades de Joyas 1945</Label>
						<Select
							name='newsletter'
							onChange={handleFilterChange}
							value={filter.newsletter}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							<option key={1} value='1'>
								Sí
							</option>
							<option key={2} value='0'>
								No
							</option>
						</Select>
					</div>
					<div>
						<Label htmlFor='rubro'>Habilitado PDJ</Label>
						<Select
							name='habilitado_pdj'
							onChange={handleFilterChange}
							value={filter.habilitado_pdj}
							className='productsListInputOrSelect'>
							<option value='' key={0}></option>

							<option key={1} value='1'>
								Sí
							</option>
							<option key={2} value='0'>
								No
							</option>
						</Select>
					</div>
					<div className='dflex productsList_filter_buttons_cont'>
						<Button
							variant='solid'
							icon='HeroMagnifyingGlass'
							onClick={() =>
								applyFilter({
									filter,
									usersInitialData: initialData.current || [],
									setData,
								})
							}
							className='productsList_filter_search_button'
							color='emerald'>
							Buscar
						</Button>
						<Button
							variant='solid'
							color='amber'
							icon='HeroArrowPath'
							onClick={resetFilter}
							className='productsList_filter_search_button'>
							Resetear filtros
						</Button>
					</div>
				</div>
			</Container>
			<Container className='pt-0'>
				<Card className='h-full'>
					<CardHeader>
						<CardHeaderChild>
							<CardTitle>Listado de Usuarios</CardTitle>
							<Badge
								variant='outline'
								className='border-transparent px-4'
								rounded='rounded-full'>
								{table.getFilteredRowModel().rows.length} registros
							</Badge>
						</CardHeaderChild>
					</CardHeader>
					<CardBody className='overflow-auto'>
						<TableTemplate className='table-fixed max-md:min-w-[70rem]' table={table} />
					</CardBody>
					<TableCardFooterTemplate table={table} />
				</Card>
			</Container>
		</PageWrapper>
	);
};

export default CustomerJoyasListPage;
