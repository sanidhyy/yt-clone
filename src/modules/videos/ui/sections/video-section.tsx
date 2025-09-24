'use client';

import { Suspense } from 'react';

import { useAuth } from '@clerk/nextjs';
import { TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { VideoBanner } from '@/modules/videos/ui/components/video-banner';
import { VideoPlayer, VideoPlayerSkeleton } from '@/modules/videos/ui/components/video-player';
import { VideoTopRow, VideoTopRowSkeleton } from '@/modules/videos/ui/components/video-top-row';

import { MuxStatus } from '@/db/schema';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface VideoSectionProps {
	videoId: string;
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
	const { isSignedIn } = useAuth();
	const utils = trpc.useUtils();

	const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
	const createView = trpc.videoViews.create.useMutation({
		onSuccess: () => {
			utils.videos.getOne.invalidate({ id: videoId });
		},
	});

	const handlePlay = () => {
		if (!isSignedIn) return;

		createView.mutate({ videoId });
	};

	return (
		<>
			<div
				className={cn(
					'relative aspect-video overflow-hidden rounded-xl bg-black',
					video.muxStatus !== MuxStatus.READY && 'rounded-b-none'
				)}
			>
				<VideoPlayer
					autoPlay
					onPlay={handlePlay}
					playbackId={video.muxPlaybackId}
					thumbnailUrl={video.thumbnailUrl}
					previewUrl={video.previewUrl}
					duration={video.duration}
					title={video.title}
					visibility={video.visibility}
				/>
			</div>

			<VideoBanner status={video.muxStatus} />
			<VideoTopRow video={video} />
		</>
	);
};

const VideoSectionSkeleton = () => {
	return (
		<>
			<VideoPlayerSkeleton />
			<VideoTopRowSkeleton />
		</>
	);
};

export const VideoSection = ({ videoId }: VideoSectionProps) => {
	return (
		<Suspense fallback={<VideoSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch video!
					</p>
				}
			>
				<VideoSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};
