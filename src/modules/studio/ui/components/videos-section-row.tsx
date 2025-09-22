'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { formatDate } from 'date-fns';
import { Globe2Icon, LockIcon } from 'lucide-react';

import type { StudioGetManyOutput } from '@/modules/studio/types';
import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail';

import { TableCell, TableRow } from '@/components/ui/table';
import { MuxStatus, VideoVisibility } from '@/db/schema';
import { cn, snakeCaseToTitle } from '@/lib/utils';

interface VideosSectionRowProps {
	video: StudioGetManyOutput['items'][number];
}

export const VideosSectionRow = ({ video }: VideosSectionRowProps) => {
	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(video.viewCount);
	}, [video.viewCount]);

	const compactComments = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(video.commentCount);
	}, [video.commentCount]);

	const compactLikes = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(video.likeCount);
	}, [video.likeCount]);

	return (
		<Link prefetch href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
			<TableRow className='cursor-pointer'>
				<TableCell className='w-[510px] pl-6'>
					<div className='flex items-center gap-4'>
						<div className='relative aspect-video w-36 shrink-0'>
							<VideoThumbnail
								duration={video.duration}
								imageUrl={video.thumbnailUrl}
								previewUrl={video.previewUrl}
								title={video.title}
								visibility={video.visibility}
							/>
						</div>

						<div className='flex flex-col gap-y-1 overflow-hidden'>
							<span className='line-clamp-1 text-sm'>{video.title}</span>
							<span
								className={cn('line-clamp-1 text-xs text-muted-foreground', !video.description?.trim() && 'italic')}
							>
								{video.description || 'No description'}
							</span>
						</div>
					</div>
				</TableCell>
				<TableCell>
					<div className='flex items-center'>
						{video.visibility === VideoVisibility.PRIVATE ? (
							<LockIcon className='mr-2 size-4' />
						) : (
							<Globe2Icon className='mr-2 size-4' />
						)}
						{snakeCaseToTitle(video.visibility)}
					</div>
				</TableCell>
				<TableCell>
					<div className='flex items-center'>{snakeCaseToTitle(video.muxStatus || MuxStatus.ERRORED)}</div>
				</TableCell>
				<TableCell className='truncate text-sm'>{formatDate(new Date(video.createdAt), 'd MMM yyyy')}</TableCell>
				<TableCell className='text-right'>{compactViews}</TableCell>
				<TableCell className='text-right'>{compactComments}</TableCell>
				<TableCell className='pr-6 text-right'>{compactLikes}</TableCell>
			</TableRow>
		</Link>
	);
};
