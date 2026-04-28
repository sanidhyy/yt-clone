import { LockIcon } from 'lucide-react';

import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';

import { Skeleton } from '@/components/ui/skeleton';
import { VideoVisibility } from '@/db/schema';
import { cn, formatDuration } from '@/lib/utils';

interface VideoThumbnailProps {
	className?: string;
	duration: number;
	title: string;
	imageUrl?: string | null;
	previewUrl?: string | null;
	visibility: VideoVisibility;
}

export const VideoThumbnailSkeleton = () => {
	return (
		<div className='relative aspect-video w-full overflow-hidden rounded-xl'>
			<Skeleton className='size-full' />
		</div>
	);
};

export const VideoThumbnail = ({
	className,
	duration,
	title,
	imageUrl,
	previewUrl,
	visibility,
}: VideoThumbnailProps) => {
	return (
		<div className='group relative'>
			{/* Thumbnail wrapper */}
			<div className={cn('relative aspect-video w-full overflow-hidden rounded-xl', className)}>
				<img
					src={imageUrl || THUMBNAIL_FALLBACK}
					alt={`Thumbnail of ${title}`}
					className='absolute inset-0 size-full object-cover opacity-100 transition-opacity duration-150 group-hover:opacity-0'
				/>

				<img
					src={previewUrl || THUMBNAIL_FALLBACK}
					alt={`Preview of ${title}`}
					className='absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-150 group-hover:opacity-100'
				/>
			</div>

			{/* Video duration box */}
			<div className='absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white opacity-100 transition-opacity duration-100 group-hover:opacity-0'>
				{formatDuration(duration)}
			</div>

			{/* Video visibility box for private videos */}
			{visibility === VideoVisibility.PRIVATE && (
				<div className='absolute right-2 top-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white opacity-100 transition-opacity duration-100 group-hover:opacity-0'>
					<LockIcon className='size-4' />
				</div>
			)}
		</div>
	);
};
