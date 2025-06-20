import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface InfiniteScrollProps {
	isManual?: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
}

export const InfiniteScroll = ({
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	isManual = false,
}: InfiniteScrollProps) => {
	const { isIntersecting, targetRef } = useIntersectionObserver({
		rootMargin: '100px',
		threshold: 0.5,
	});

	useEffect(() => {
		if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) fetchNextPage();
	}, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage]);

	return (
		<div className='flex flex-col items-center gap-4 p-4'>
			<div ref={targetRef} className='h-1' />

			{hasNextPage ? (
				<Button
					variant='secondary'
					disabled={!hasNextPage || isFetchingNextPage}
					isLoading={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage ? 'Loading...' : 'Load more'}
				</Button>
			) : (
				<p className='text-xs text-muted-foreground'>You have reached the end of the list.</p>
			)}
		</div>
	);
};
