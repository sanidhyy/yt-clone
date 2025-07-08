import { useMemo } from 'react';

import { formatDate, formatDistanceToNow } from 'date-fns';

import type { VideoGetOneOutput } from '@/modules/videos/types';

import { Skeleton } from '@/components/ui/skeleton';

import { VideoDescription } from './video-description';
import { VideoMenu } from './video-menu';
import { VideoOwner } from './video-owner';
import { VideoReactions } from './video-reactions';

export const VideoTopRowSkeleton = () => {
	return (
		<div className='mt-4 flex flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<Skeleton className='h-6 w-4/5 md:w-2/5' />
			</div>

			<div className='flex w-full items-center justify-between'>
				<div className='flex w-[70%] items-center gap-3'>
					<Skeleton className='size-10 shrink-0 rounded-full' />

					<div className='flex w-full flex-col gap-2'>
						<Skeleton className='h-5 w-4/5 md:w-2/6' />
						<Skeleton className='h-5 w-3/5 md:w-1/5' />
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<Skeleton className='h-9 w-[130px] rounded-full' />
					<Skeleton className='size-9 rounded-full' />
				</div>
			</div>

			<div className='h-[120px] w-full' />
		</div>
	);
};

interface VideoTopRowProps {
	video: VideoGetOneOutput;
}

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(video.viewCount);
	}, [video.viewCount]);

	const expandedViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'standard',
		}).format(video.viewCount);
	}, [video.viewCount]);

	const compactDate = useMemo(() => {
		return formatDistanceToNow(video.createdAt, { addSuffix: true });
	}, [video.createdAt]);

	const expandedDate = useMemo(() => {
		return formatDate(video.createdAt, 'd MMM yyyy');
	}, [video.createdAt]);

	return (
		<div className='mt-4 flex flex-col gap-4'>
			<h1 className='text-xl font-semibold'>{video.title}</h1>

			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<VideoOwner user={video.user} videoId={video.id} />

				<div className='-mb-2 flex gap-2 overflow-x-auto pb-2 sm:mb-0 sm:min-w-[calc(50%_-_6px)] sm:justify-end sm:overflow-visible sm:pb-0'>
					<VideoReactions
						dislikes={video.dislikeCount}
						likes={video.likeCount}
						videoId={video.id}
						viewerReaction={video.viewerReaction}
					/>

					<VideoMenu videoId={video.id} variant='secondary' />
				</div>
			</div>

			<VideoDescription
				compactDate={compactDate}
				compactViews={compactViews}
				expandedDate={expandedDate}
				expandedViews={expandedViews}
				description={video.description}
				views={video.viewCount}
			/>
		</div>
	);
};
