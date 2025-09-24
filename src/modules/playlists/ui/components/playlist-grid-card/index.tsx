'use client';

import Link from 'next/link';

import toast from 'react-hot-toast';

import type { PlaylistGetManyOuput } from '@/modules/playlists/types';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';

import { useConfirm } from '@/hooks/use-confirm';
import { trpc } from '@/trpc/client';

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
	const [ConfirmDialog, confirm] = useConfirm({
		message: 'Are you sure you want to delete this playlist? This action cannot be undone.',
		title: 'Delete playlist',
	});

	const utils = trpc.useUtils();

	const remove = trpc.playlists.remove.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove playlist!');
		},
		onSuccess: () => {
			toast.success('Playlist removed!');

			utils.playlists.getMany.invalidate();
		},
	});

	const handleRemove = async () => {
		const ok = await confirm();

		if (!ok) return;

		remove.mutate({ id: data.id });
	};

	return (
		<>
			<ConfirmDialog />

			<Link prefetch href={`/playlists/${data.id}`}>
				<div className='group flex w-full flex-col gap-2'>
					<PlaylistThumbnail
						imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK}
						title={data.name}
						videoCount={data.videoCount}
					/>
					<PlaylistInfo id={data.id} name={data.name} onRemove={handleRemove} isPending={remove.isPending} />
				</div>
			</Link>
		</>
	);
};
