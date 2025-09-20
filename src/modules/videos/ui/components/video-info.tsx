import { useMemo } from 'react';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';

import { UserInfo } from '@/modules/users/ui/components/user-info';
import { VideoGetManyOutput } from '@/modules/videos/types';

import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';

import { VideoMenu } from './video-menu';

interface VideoInfoProps {
	data: VideoGetManyOutput['items'][number];
	onRemove?: () => void;
}

export const VideoInfoSkeleton = () => {
	return (
		<div className='flex gap-3'>
			<Skeleton className='size-10 shrink-0 rounded-full' />

			<div className='min-w-0 flex-1 space-y-2'>
				<Skeleton className='h-5 w-[90%]' />
				<Skeleton className='h-5 w-[70%]' />
			</div>
		</div>
	);
};

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
	const compactDate = useMemo(() => {
		return formatDistanceToNow(data.createdAt, { addSuffix: true });
	}, [data.createdAt]);

	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(data.viewCount);
	}, [data.viewCount]);

	return (
		<div className='flex gap-3'>
			<Link href={`/users/${data.userId}`}>
				<UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
			</Link>

			<div className='min-w-0 flex-1'>
				<Link href={`/videos/${data.id}`}>
					<h3 className='line-clamp-1 break-words text-base font-medium lg:line-clamp-2'>{data.title}</h3>
				</Link>

				<Link href={`/users/${data.userId}`}>
					<UserInfo name={data.user.name} />
				</Link>

				<Link href={`/videos/${data.id}`}>
					<p className='line-clamp-1 text-sm text-gray-600'>
						{compactViews} view{data.viewCount === 1 ? '' : 's'} • {compactDate}
					</p>
				</Link>
			</div>

			<div className='shrink-0'>
				<VideoMenu videoId={data.id} onRemove={onRemove} />
			</div>
		</div>
	);
};
