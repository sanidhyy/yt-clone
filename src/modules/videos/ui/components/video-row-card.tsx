import { useMemo } from 'react';
import Link from 'next/link';

import { cva, type VariantProps } from 'class-variance-authority';

import { UserInfo } from '@/modules/users/ui/components/user-info';
import { VideoGetManyOutput } from '@/modules/videos/types';

import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

import { VideoMenu } from './video-menu';
import { VideoThumbnail } from './video-thumbnail';

const videoRowCardVariants = cva('group flex min-w-0', {
	defaultVariants: {
		size: 'default',
	},
	variants: {
		size: {
			compact: 'gap-2',
			default: 'gap-4',
		},
	},
});

const thumbnailVariants = cva('relative flex-none', {
	defaultVariants: {
		size: 'default',
	},
	variants: {
		size: {
			compact: 'w-[168px]',
			default: 'w-[38%]',
		},
	},
});

export const VideoRowCardSkeleton = () => {
	// TODO: Complete skeleton ui
	return <div>Skeleton</div>;
};

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
	data: VideoGetManyOutput['items'][number];
	onRemove?: () => void;
}

export const VideoRowCard = ({ data, onRemove, size }: VideoRowCardProps) => {
	const compactLikes = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(data.likeCount);
	}, [data.likeCount]);

	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(data.viewCount);
	}, [data.viewCount]);

	const isCompact = size === 'compact';

	return (
		<div className={videoRowCardVariants({ size })}>
			{/* Thumbnail */}
			<Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
				<VideoThumbnail
					duration={data.duration}
					title={data.title}
					imageUrl={data.thumbnailUrl}
					previewUrl={data.previewUrl}
				/>
			</Link>

			{/* Info */}
			<div className='min-w-0 flex-1'>
				<div className='flex justify-between gap-x-2'>
					<Link href={`/videos/${data.id}`} className='min-w-0 flex-1'>
						<h3 className={cn('line-clamp-2 font-medium', isCompact ? 'text-sm' : 'text-base')}>{data.title}</h3>

						{!isCompact && (
							<>
								<p className='mt-1 text-xs text-muted-foreground'>
									{compactViews} view{data.viewCount === 1 ? '' : 's'} • {compactLikes} like
									{data.likeCount === 1 ? '' : 's'}
								</p>

								<div className='my-3 flex items-center gap-2'>
									<UserAvatar size='sm' imageUrl={data.user.imageUrl} name={data.user.name} />
									<UserInfo size='sm' name={data.user.name} />
								</div>

								<Tooltip>
									<TooltipTrigger asChild>
										<p
											className={cn(
												'line-clamp-3 text-xs text-muted-foreground',
												!data.description?.trim() && 'italic'
											)}
										>
											{data.description || 'No description'}
										</p>
									</TooltipTrigger>

									<TooltipContent side='bottom' align='center' className='bg-black/70'>
										<p>From the video description</p>
									</TooltipContent>
								</Tooltip>
							</>
						)}

						{isCompact && (
							<>
								<UserInfo size='sm' name={data.user.name} />

								<p className='mt-1 text-xs text-muted-foreground'>
									{compactViews} view{data.viewCount === 1 ? '' : 's'} • {compactLikes} like
									{data.likeCount === 1 ? '' : 's'}
								</p>
							</>
						)}
					</Link>

					<div className='flex-none'>
						<VideoMenu videoId={data.id} onRemove={onRemove} />
					</div>
				</div>
			</div>
		</div>
	);
};
