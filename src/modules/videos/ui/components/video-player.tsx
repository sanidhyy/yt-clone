import MuxPlayer from '@mux/mux-player-react';

import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';

import { VideoThumbnail } from './video-thumbnail';

interface VideoPlayerProps {
	autoPlay?: boolean;
	duration: number;
	onPlay?: () => void;
	playbackId?: string | null;
	thumbnailUrl?: string | null;
	previewUrl?: string | null;
	title: string;
}

export const VideoPlayer = ({
	autoPlay,
	duration,
	onPlay,
	playbackId,
	thumbnailUrl,
	previewUrl,
	title,
}: VideoPlayerProps) => {
	if (!playbackId) {
		return (
			<VideoThumbnail
				className='rounded-b-none'
				duration={duration}
				title={title}
				imageUrl={thumbnailUrl}
				previewUrl={previewUrl}
			/>
		);
	}

	return (
		<MuxPlayer
			playbackId={playbackId}
			poster={thumbnailUrl || THUMBNAIL_FALLBACK}
			playerInitTime={0}
			autoPlay={autoPlay}
			thumbnailTime={0}
			className='size-full object-contain'
			accentColor='#ff2056'
			onPlay={onPlay}
		/>
	);
};
