'use client';

import { useEffect, useState } from 'react';

import MuxPlayer from '@mux/mux-video-react';
import MediaThemeYt from 'player.style/yt/react';

import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';

import { VideoThumbnail } from './video-thumbnail';

import '@/modules/videos/ui/css/mux-player.css';

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
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => setIsMounted(true), []);

	if (!isMounted) return null;

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
		<MediaThemeYt className='size-full object-contain'>
			<MuxPlayer
				slot='media'
				playbackId={playbackId}
				poster={thumbnailUrl || THUMBNAIL_FALLBACK}
				playerInitTime={0}
				autoPlay={autoPlay}
				className='size-full object-contain'
				onPlay={onPlay}
				crossOrigin='anonymous'
			/>
		</MediaThemeYt>
	);
};
