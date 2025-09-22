import Link from 'next/link';

import type { PlaylistGetManyOuput } from '@/modules/playlists/types';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';

import { PlaylistInfo, PlaylistInfoSkeleton } from './playlist-info';
import { PlaylistThumbnail, PlaylistThumbnailSkeleton } from './playlist-thumbnail';

interface PlaylistGridCardProps {
	data: PlaylistGetManyOuput['items'][number];
}

export const PlaylistGridCardSkeleton = () => {
	return (
		<div className='flex w-full flex-col gap-2'>
			<PlaylistThumbnailSkeleton />
			<PlaylistInfoSkeleton />
		</div>
	);
};

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
	return (
		<Link prefetch href={`/playlists/${data.id}`}>
			<div className='group flex w-full flex-col gap-2'>
				<PlaylistThumbnail
					imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK}
					title={data.name}
					videoCount={data.videoCount}
				/>
				<PlaylistInfo name={data.name} />
			</div>
		</Link>
	);
};
