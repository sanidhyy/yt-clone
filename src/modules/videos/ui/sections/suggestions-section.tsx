'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard, VideoRowCardSkeleton } from '@/modules/videos/ui/components/video-row-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface SuggestionsSectionProps {
	videoId: string;
}

const SuggestionsSectionSkeleton = () => {
	return (
		<>
			<div className='hidden space-y-3 md:block'>
				{Array.from({ length: 8 }).map((_, i) => (
					<VideoRowCardSkeleton key={`row-card-${i}`} size='compact' />
				))}
			</div>

			<div className='block space-y-10 md:hidden'>
				{Array.from({ length: 8 }).map((_, i) => (
					<VideoGridCardSkeleton key={`grid-card-${i}`} />
				))}
			</div>
		</>
	);
};

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
	return (
		<Suspense fallback={<SuggestionsSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<SuggestionsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const SuggestionsSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
	const [suggestions, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
			videoId,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<>
			<div className='hidden space-y-3 md:block'>
				{suggestions.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoRowCard key={video.id} data={video} size='compact' />
					))}
			</div>

			<div className='block space-y-10 md:hidden'>
				{suggestions.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard key={video.id} data={video} />
					))}
			</div>

			<InfiniteScroll
				fetchNextPage={query.fetchNextPage}
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
			/>
		</>
	);
};
