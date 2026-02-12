import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/icon/Icon';
import Button from '../../../../components/ui/Button';
import Card, { CardBody } from '../../../../components/ui/Card';
import { insertDotsInPrice, timestampToDateAndHour } from '../../../../utils/utils';
import { InProcessOrderCardData } from '../inProcessOrders.types';
import ThumbnailsStrip from './ThumbnailsStrip.partial';

type InProcessOrderCardProps = {
	data: InProcessOrderCardData;
	onDeleteCart: (cartId: number, userName: string) => void;
	onSendEmail: () => void;
};

const InProcessOrderCard: React.FC<InProcessOrderCardProps> = ({
	data,
	onDeleteCart,
	onSendEmail,
}) => {
	return (
		<Card className='w-full max-w-[420px] rounded-xl border border-zinc-200 shadow-lg transition-shadow hover:shadow-xl dark:border-zinc-700'>
			<CardBody className='flex flex-col gap-3 p-4'>
				{/* Header: User info */}
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
						<Icon icon='HeroUser' size='text-xl' color='blue' />
					</div>
					<div className='min-w-0 flex-1'>
						<Link
							to={`/crm/customer/${data.userId}`}
							className='block truncate font-semibold text-blue-600 hover:underline dark:text-blue-400'>
							{data.userName}
						</Link>
						<span className='block truncate text-xs text-zinc-500 dark:text-zinc-400'>
							{data.userEmail}
						</span>
					</div>
				</div>

				{/* Thumbnails strip */}
				<ThumbnailsStrip thumbnails={data.thumbnails} />

				{/* Meta info */}
				<div className='grid grid-cols-2 gap-2 text-sm'>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Ingreso:</span>
						<div className='font-medium'>
							{timestampToDateAndHour(data.lastActionDate)}
						</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Artículos:</span>
						<div className='font-medium'>{data.articlesQty}</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Monto:</span>
						<div className='font-medium text-emerald-600 dark:text-emerald-400'>
							${insertDotsInPrice(data.total)}
						</div>
					</div>
					<div>
						<span className='text-zinc-500 dark:text-zinc-400'>Última acción:</span>
						<div className='font-medium'>
							{data.lastActionHours} {data.lastActionHours === 1 ? 'hora' : 'horas'}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className='mt-auto flex gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700'>
					<Button
						variant='outline'
						color='red'
						size='sm'
						icon='HeroTrash'
						className='flex-1'
						onClick={() => onDeleteCart(data.cartId, data.userName)}>
						Borrar
					</Button>
					<Button
						variant='outline'
						color='blue'
						size='sm'
						icon='HeroEnvelope'
						className='flex-1'
						onClick={onSendEmail}>
						Email
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default InProcessOrderCard;
