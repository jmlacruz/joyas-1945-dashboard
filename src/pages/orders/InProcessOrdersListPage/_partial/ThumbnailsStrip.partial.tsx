import React, { useCallback, useRef, useState } from 'react';
import Icon from '../../../../components/icon/Icon';

type ThumbnailsStripProps = {
	thumbnails: string[];
};

// Thumbnail size: 96px + 12px gap. Show 3 = 312px (3*96 + 2*12)
const THUMB_SIZE = 96;
const THUMB_GAP = 12;
const SCROLL_AMOUNT = THUMB_SIZE + THUMB_GAP; // 108px per item
const CONTAINER_WIDTH = THUMB_SIZE * 3 + THUMB_GAP * 2; // 312px for 3 thumbnails

const ThumbnailsStrip: React.FC<ThumbnailsStripProps> = ({ thumbnails }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(thumbnails.length > 3);

	const updateScrollState = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 0);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
	}, []);

	const scroll = (direction: 'left' | 'right') => {
		if (!containerRef.current) return;
		containerRef.current.scrollBy({
			left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
			behavior: 'smooth',
		});
		// Update state after scroll animation
		setTimeout(updateScrollState, 150);
	};

	if (thumbnails.length === 0) {
		return (
			<div className='flex h-24 items-center justify-center rounded bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800'>
				Sin imágenes
			</div>
		);
	}

	const showArrows = thumbnails.length > 3;

	return (
		<div className='flex items-center gap-1'>
			{showArrows && (
				<button
					type='button'
					onClick={() => scroll('left')}
					disabled={!canScrollLeft}
					className='flex h-8 w-6 shrink-0 items-center justify-center rounded bg-zinc-200 transition-opacity hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-700 dark:hover:bg-zinc-600'
					aria-label='Anterior'>
					<Icon icon='HeroChevronLeft' size='text-sm' />
				</button>
			)}

			<div
				ref={containerRef}
				onScroll={updateScrollState}
				className='flex [&::-webkit-scrollbar]:hidden'
				style={{
					width: CONTAINER_WIDTH,
					gap: THUMB_GAP,
					overflowX: 'scroll',
					scrollSnapType: 'x mandatory',
					scrollbarWidth: 'none', // Firefox
					msOverflowStyle: 'none', // IE/Edge
				}}>
				{thumbnails.map((src, index) => (
					<div
						key={`${src}-${index}`}
						className='shrink-0 overflow-hidden rounded border border-zinc-200 dark:border-zinc-700'
						style={{
							width: THUMB_SIZE,
							height: THUMB_SIZE,
							scrollSnapAlign: 'start',
						}}>
						<img
							src={src}
							alt={`Producto ${index + 1}`}
							className='h-full w-full object-cover'
							loading='lazy'
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					</div>
				))}
			</div>

			{showArrows && (
				<button
					type='button'
					onClick={() => scroll('right')}
					disabled={!canScrollRight}
					className='flex h-8 w-6 shrink-0 items-center justify-center rounded bg-zinc-200 transition-opacity hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-700 dark:hover:bg-zinc-600'
					aria-label='Siguiente'>
					<Icon icon='HeroChevronRight' size='text-sm' />
				</button>
			)}
		</div>
	);
};

export default ThumbnailsStrip;
