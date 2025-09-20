import Link from 'next/link';

import { VideoGetManyOutput } from '@/modules/videos/types';

import { VideoInfo, VideoInfoSkeleton } from './video-info';
import { VideoThumbnail, VideoThumbnailSkeleton } from './video-thumbnail';

interface VideoGridCardProps {
	data: VideoGetManyOutput['items'][number];
	onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
	return (
		<div className='flex w-full flex-col gap-2'>
			<VideoThumbnailSkeleton />
			<VideoInfoSkeleton />
		</div>
	);
};

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
