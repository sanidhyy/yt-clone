'use client';

import { Suspense } from 'react';

import { TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard, VideoRowCardSkeleton } from '@/modules/videos/ui/components/video-row-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface ResultsSectionProps {
	query: string | undefined;
	categoryId: string | undefined;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
	return (
		<Suspense key={`${query}-${categoryId}`} fallback={<ResultsSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch search results!
					</p>
				}
			>
				<ResultsSectionSuspense query={query} categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const ResultsSectionSkeleton = () => {
	return (
		<>
			<div className='hidden flex-col gap-4 md:flex'>
				{Array.from({ length: 5 }).map((_, i) => (
					<VideoRowCardSkeleton key={i} />
				))}
			</div>

			<div className='flex flex-col gap-x-4 gap-y-10 p-4 pt-6 md:hidden'>
				{Array.from({ length: 5 }).map((_, i) => (
					<VideoGridCardSkeleton key={i} />
				))}
			</div>
		</>
	);
};

const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
	const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
		{
			categoryId,
			limit: DEFAULT_LIMIT,
			query,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<>
			<div className='flex flex-col gap-4 gap-y-10 md:hidden'>
				{results.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard key={video.id} data={video} />
					))}
			</div>

			<div className='hidden flex-col gap-4 md:flex'>
				{results.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoRowCard key={video.id} data={video} />
					))}
			</div>

			<InfiniteScroll
				hasNextPage={resultsQuery.hasNextPage}
				isFetchingNextPage={resultsQuery.isFetchingNextPage}
				fetchNextPage={resultsQuery.fetchNextPage}
			/>
		</>
	);
};
