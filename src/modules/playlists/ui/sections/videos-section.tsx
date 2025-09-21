'use client';

import { Suspense } from 'react';

import { useAuth } from '@clerk/nextjs';
import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard, VideoRowCardSkeleton } from '@/modules/videos/ui/components/video-row-card';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface VideosSectionProps {
	playlistId: string;
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
	return (
		<Suspense fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideosSectionSuspense playlistId={playlistId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionSkeleton = () => {
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

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
	const utils = trpc.useUtils();
	const { userId, isLoaded } = useAuth();

	const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
			playlistId,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

	const removeVideo = trpc.playlists.removeVideo.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove video from playlist!');
		},
		onSuccess: (data) => {
			utils.playlists.getMany.invalidate();
			utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
			utils.playlists.getOne.invalidate({ id: playlistId });
			utils.playlists.getVideos.invalidate({ playlistId });
		},
	});

	return (
		<>
			<div className='flex flex-col gap-x-4 gap-y-10 md:hidden'>
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard
							key={video.id}
							data={video}
							onRemove={
								isLoaded && userId && playlist.user.clerkId === userId
									? () => removeVideo.mutate({ playlistId, videoId: video.id })
									: undefined
							}
						/>
					))}
			</div>

			<div className='hidden flex-col gap-4 md:flex'>
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoRowCard
							key={video.id}
							data={video}
							size='compact'
							onRemove={
								isLoaded && userId && playlist.user.clerkId === userId
									? () => removeVideo.mutate({ playlistId, videoId: video.id })
									: undefined
							}
						/>
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
