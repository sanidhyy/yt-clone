'use client';

import { VideoGridCard } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard } from '@/modules/videos/ui/components/video-row-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface SuggestionsSectionProps {
	isManual?: boolean;
	videoId: string;
}

export const SuggestionsSection = ({ isManual = false, videoId }: SuggestionsSectionProps) => {
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
				isManual={isManual}
			/>
		</>
	);
};
