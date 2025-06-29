'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { VideoBanner } from '@/modules/videos/ui/components/video-banner';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import { VideoTopRow } from '@/modules/videos/ui/components/video-top-row';

import { MuxStatus } from '@/db/schema';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface VideoSectionProps {
	videoId: string;
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
	const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

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
					onPlay={() => {}}
					playbackId={video.muxPlaybackId}
					thumbnailUrl={video.thumbnailUrl}
					previewUrl={video.previewUrl}
					duration={video.duration}
					title={video.title}
				/>
			</div>

			<VideoBanner status={video.muxStatus} />
			<VideoTopRow video={video} />
		</>
	);
};

export const VideoSection = ({ videoId }: VideoSectionProps) => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideoSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};
