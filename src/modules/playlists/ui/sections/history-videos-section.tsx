'use client';

import { Suspense } from 'react';

import { TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard, VideoRowCardSkeleton } from '@/modules/videos/ui/components/video-row-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

export const HistoryVideosSection = () => {
	return (
		<Suspense fallback={<HistoryVideosSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch history videos!
					</p>
				}
			>
				<HistoryVideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const HistoryVideosSectionSkeleton = () => {
	return (
		<>
			<div className='flex flex-col gap-x-4 gap-y-10 md:hidden'>
				{Array.from({ length: 18 }).map((_, i) => (
					<VideoGridCardSkeleton key={i} />
				))}
			</div>

			<div className='hidden flex-col gap-4 md:flex'>
				{Array.from({ length: 18 }).map((_, i) => (
					<VideoRowCardSkeleton key={i} size='compact' />
				))}
			</div>
		</>
	);
};

const HistoryVideosSectionSuspense = () => {
	const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<>
			<div className='flex flex-col gap-x-4 gap-y-10 md:hidden'>
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard key={video.id} data={video} />
					))}
			</div>

			<div className='hidden flex-col gap-4 md:flex'>
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoRowCard key={video.id} data={video} size='compact' />
					))}
			</div>

			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</>
	);
};
