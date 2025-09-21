'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface VideosSectionProps {
	userId: string;
}

export const VideosSection = ({ userId }: VideosSectionProps) => {
	return (
		<Suspense fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideosSectionSuspense userId={userId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionSkeleton = () => {
	return (
		<div className='grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'>
			{Array.from({ length: 18 }).map((_, i) => (
				<VideoGridCardSkeleton key={i} />
			))}
		</div>
	);
};

const VideosSectionSuspense = ({ userId }: VideosSectionProps) => {
	const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
			userId,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<>
			<div className='grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'>
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
