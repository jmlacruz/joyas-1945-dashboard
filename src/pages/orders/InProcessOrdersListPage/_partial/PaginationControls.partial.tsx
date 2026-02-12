import React from 'react';
import Button from '../../../../components/ui/Button';
import { PaginationState } from '../inProcessOrders.types';

type PaginationControlsProps = {
	pagination: PaginationState;
	displayedCount: number;
	fetchedCount: number;
	onPageChange: (pageIndex: number) => void;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
	pagination,
	displayedCount,
	fetchedCount,
	onPageChange,
}) => {
	const { pageIndex, pageSize, totalCount } = pagination;

	const totalPages = Math.ceil(totalCount / pageSize);
	const canGoPrev = pageIndex > 0;
	const canGoNext = pageIndex < totalPages - 1;

	if (totalCount === 0) {
		return null;
	}

	return (
		<div className='flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700'>
			<div className='text-sm text-zinc-600 dark:text-zinc-400'>
				Mostrando {displayedCount} {displayedCount === 1 ? 'carrito' : 'carritos'} en proceso
				{fetchedCount > displayedCount && (
					<span className='text-zinc-400'> (de {fetchedCount} en esta página)</span>
				)}
			</div>

			<div className='flex items-center gap-2'>
				<Button
					variant='outline'
					size='sm'
					icon='HeroChevronDoubleLeft'
					isDisable={!canGoPrev}
					onClick={() => onPageChange(0)}
					aria-label='Primera página'
				/>
				<Button
					variant='outline'
					size='sm'
					icon='HeroChevronLeft'
					isDisable={!canGoPrev}
					onClick={() => onPageChange(pageIndex - 1)}
					aria-label='Página anterior'
				/>

				<span className='px-2 text-sm'>
					Página {pageIndex + 1} de {totalPages || 1}
				</span>

				<Button
					variant='outline'
					size='sm'
					icon='HeroChevronRight'
					isDisable={!canGoNext}
					onClick={() => onPageChange(pageIndex + 1)}
					aria-label='Página siguiente'
				/>
				<Button
					variant='outline'
					size='sm'
					icon='HeroChevronDoubleRight'
					isDisable={!canGoNext}
					onClick={() => onPageChange(totalPages - 1)}
					aria-label='Última página'
				/>
			</div>
		</div>
	);
};

export default PaginationControls;
