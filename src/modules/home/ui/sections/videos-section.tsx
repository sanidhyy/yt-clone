'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface VideosSectionProps {
	categoryId?: string;
}

export const VideosSection = ({ categoryId }: VideosSectionProps) => {
	return (
		<Suspense key={categoryId} fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideosSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionSkeleton = () => {
	return (
		<div className='grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6'>
			{Array.from({ length: 18 }).map((_, i) => (
				<VideoGridCardSkeleton key={i} />
			))}
		</div>
	);
};

const VideosSectionSuspense = ({ categoryId }: VideosSectionProps) => {
	const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
		{
			categoryId,
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<>
			<div className='grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6'>
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard key={video.id} data={video} />
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
