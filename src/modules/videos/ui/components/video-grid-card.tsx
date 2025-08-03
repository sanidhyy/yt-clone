import Link from 'next/link';

import { VideoGetManyOutput } from '@/modules/videos/types';

import { VideoInfo } from './video-info';
import { VideoThumbnail } from './video-thumbnail';

interface VideoGridCardProps {
	data: VideoGetManyOutput['items'][number];
	onRemove?: () => void;
}

// TODO: Add skeleton ui

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
	return (
		<div className='group flex w-full flex-col gap-2'>
			{/* Thumbnail */}
			<Link href={`/videos/${data.id}`}>
				<VideoThumbnail
					duration={data.duration}
					title={data.title}
					imageUrl={data.thumbnailUrl}
					previewUrl={data.previewUrl}
				/>
			</Link>

			{/* Info */}
			<VideoInfo data={data} onRemove={onRemove} />
		</div>
	);
};
