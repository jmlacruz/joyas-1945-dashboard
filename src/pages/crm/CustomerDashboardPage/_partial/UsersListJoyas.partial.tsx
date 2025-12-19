import { Link } from 'react-router-dom';

import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';

import React, { useState, useEffect } from 'react';
import Tooltip from '../../../../components/ui/Tooltip';
import { Usuario, Vendedor } from '../../../../types/DASHBOARD/database';
import { updateTable, getTable} from '../../../../services/database';
import AvatarCustom from '../../../../components/DASHBOARD/avatar/Avatar';
import CheckBox1 from '../../../../components/DASHBOARD/checkBoxs/CheckBox1';

import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../../components/ui/Card';
import Icon from '../../../../components/icon/Icon';
import TableTemplate, {
	TableCardFooterTemplate,
} from '../../../../templates/common/TableParts.template';
import Input from '../../../../components/form/Input';
import FieldWrap from '../../../../components/form/FieldWrap';

const columnHelper = createColumnHelper <Usuario> ();
const tableData: {data: Usuario[], setData: React.Dispatch<React.SetStateAction<Usuario[]>>} = {data: [], setData: () => {}};

const enableUser = async (enabled: boolean, userId: number) => {							//Función que se le pasa al check de habilitar usuario en la tabla de usuarios (para habilitar o deshabilitar un usuario)
	const response = await updateTable({tableName: "usuario", conditions: [{field: "id", value: userId}], data: {habilitado: enabled ? "1": "0"}});
	if (response.success) {
		const userToUpdateIndex = tableData.data.findIndex(user => user.id === userId);
		if (userToUpdateIndex !== -1) {
			tableData.data[userToUpdateIndex].habilitado = enabled ? "1": "0";
			tableData.setData(tableData.data);
		} 
	}
};

const columns = [
	columnHelper.accessor('permisos', {
		cell: (info) => (
			<AvatarCustom
				src={info.getValue() === "10" ? "/images/icons/admin.png" : "/images/icons/user.png"}
				name={`${info.row.original.nombre} ${info.row.original.apellido}`}
				className={`!aspect-[1/1] ${info.getValue() === "10" ? "!w-9 customAvatar_hue" : "!w-8"} !object-contain`}
				rounded='rounded'
			/>
		),
		header: '',
		footer: '',
		enableGlobalFilter: false,
		enableSorting: false,
	}),
	columnHelper.accessor('id', {
		cell: (info) => <span>{info.getValue()}</span>,
		header: 'ID',
		footer: 'ID',
	}),
	columnHelper.accessor('email', {
		cell: (info) => (
			<a href={`mailto:${info.getValue()}`} className='flex items-center gap-2'>
				{info.getValue()}
				{info.row.original.habilitado === "1" ? <Tooltip text='Habilitado'><Icon icon='HeroCheckBadge' color='emerald' size='text-2xl'/></Tooltip> : <Tooltip text='Inhabilitado'><Icon icon='HeroXCircle' color='red' size='text-2xl'/></Tooltip>}
			</a>
		),
		header: 'Email',
		footer: 'Email',
	}),
	columnHelper.accessor('nombre', {
		cell: (info) => (
			<div className='font-bold'>{`${info.row.original.nombre}`}</div>
		),
		header: 'Nombre',
		footer: 'Nombre',
	}),
	columnHelper.accessor('apellido', {
		cell: (info) => (
			<div className='font-bold'>{`${info.row.original.apellido}`}</div>
		),
		header: 'Apellido',
		footer: 'Apellido',
	}),
	columnHelper.accessor('provincia', {
		cell: (info) => <span>{info.getValue()}</span>,
		header: 'Provincia',
		footer: 'Provincia',
	}),
	columnHelper.accessor('ciudad', {
		cell: (info) => <span>{info.getValue()}</span>,
		header: 'Ciudad',
		footer: 'Ciudad',
	}),
	columnHelper.accessor('rubro', {
		cell: (info) => <span style={{textTransform: "capitalize"}}>{info.getValue()}</span>,
		header: 'Rubro',
		footer: 'Rubro',
	}),
	columnHelper.accessor('vendedor', {
		cell: (info) => <span style={{textTransform: "capitalize"}}>{info.getValue()}</span>,
		header: 'Vendedor',
		footer: 'Vendedor',
	}),
	columnHelper.accessor('permisos', {
		cell: (info) => <span>{info.getValue() === "10" ? "Administrador" : "Usuario"}</span>,
		header: 'Permisos',
		footer: 'Permisos',

	}),
	columnHelper.accessor('habilitado', {
		cell: (info) =>  
			<div className='dflex wh100'>
				<CheckBox1 text='' checkedFunction={enableUser} dataInput={info.row.original.id} defaultValue={info.getValue() === "1"} />
			</div >,
		header: 'Habilitado',
		footer: 'Habilitado',
	}),
	columnHelper.accessor('id', {
		cell: (info) => 
			<Link className='dflex wh100' to={`/crm/customer/${info.getValue()}`}>
				<Tooltip text='Modificar Usuario'>
					<Icon icon='HeroPencilSquare' color='blue' size='text-3xl' />
				</Tooltip>
			</Link>,
		header: 'Editar',
		footer: 'Editar',
		enableSorting: false
	}),
	columnHelper.accessor('id', {
		cell: () => 
			<div className='dflex wh100'>
				<Tooltip text='Eliminar Usuario'><Icon icon='HeroTrash' color='red' size='text-3xl' className='trashIconRed'/>
				</Tooltip>
			</div>,
		header: 'Eliminar',
		footer: 'Eliminar',
		enableSorting: false
	}),
];

const UserListPartialJoyas = () => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState<string>('');

	const [data, setData] = useState <Usuario[]> ([]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		enableGlobalFilter: true,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 5 },
		},
		// debugTable: true,
	});

	useEffect(() => {
		(async () => {
			const response1 = await getTable({tableName: "vendedor", fields: ["codigo", "nombre", "id"]});													//Obtenemos tabla de vendedores para luego asignar sus nombres en la tabla de usuarios
			const sellersData: Vendedor [] = response1.data;
				
			const response2 = await getTable({
				tableName: "usuario", 
				fields: ["email", "permisos", "nombre", "apellido", "rubro", "habilitado", "id", "provincia", "ciudad", "rubro", "vendedor"], 
				// limit: 10
			});
			if (response2.success && response2.data && response2.data.length) {
				const usersData: Usuario[] = response2.data;

				if (sellersData && sellersData.length) {
					const usersDataWithSellerName = usersData.map((user) => {
						const sellerData = sellersData.find((seller) => seller.codigo === user.vendedor.toString());
						return {
							...user,
							vendedor: sellerData?.nombre || "",
						};
					});
					setData(usersDataWithSellerName);
				} else {
					setData(usersData);
				}
			}
		})();
	}, []);

	useEffect(() => {
		tableData.data = structuredClone(data);
		tableData.setData = setData;
	}, [data]);

	return (
		<Card className='h-full'>
			<CardHeader>
				<CardHeaderChild>
					<CardTitle>Usuarios</CardTitle>
				</CardHeaderChild>
				<CardHeaderChild>
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
							placeholder='Search...'
							value={globalFilter ?? ''}
							onChange={(e) => setGlobalFilter(e.target.value)}
						/>
					</FieldWrap>
				</CardHeaderChild>
			</CardHeader>
			<CardBody className='overflow-auto'>
				<TableTemplate
					className='table-fixed max-md:min-w-[70rem]'
					table={table}
					hasFooter={false}
				/>
			</CardBody>
			<TableCardFooterTemplate table={table} />
		</Card>
	);
};

export default UserListPartialJoyas;
