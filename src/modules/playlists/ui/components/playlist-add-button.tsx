'use client';

import { Loader2Icon, SquareCheckIcon, SquareIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import type { PlaylistGetManyForVideoOuput } from '@/modules/playlists/types';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';

interface PlaylistAddButtonProps {
	playlist: PlaylistGetManyForVideoOuput['items'][number];
	videoId: string;
}

export const PlaylistAddButton = ({ playlist, videoId }: PlaylistAddButtonProps) => {
	const utils = trpc.useUtils();

	const addVideo = trpc.playlists.addVideo.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to add video to playlist!');
		},
		onSuccess: () => {
			utils.playlists.getMany.invalidate();
			utils.playlists.getManyForVideo.invalidate({ videoId });
			utils.playlists.getOne.invalidate({ id: playlist.id });
			utils.playlists.getVideos.invalidate({ playlistId: playlist.id });
		},
	});

	const removeVideo = trpc.playlists.removeVideo.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove video from playlist!');
		},
		onSuccess: () => {
			utils.playlists.getMany.invalidate();
			utils.playlists.getManyForVideo.invalidate({ videoId });
			utils.playlists.getOne.invalidate({ id: playlist.id });
			utils.playlists.getVideos.invalidate({ playlistId: playlist.id });
		},
	});

	const isPending = addVideo.isPending || removeVideo.isPending;

	const handleAction = () => {
		if (playlist.containsVideo) {
			removeVideo.mutate({ playlistId: playlist.id, videoId });
		} else {
			addVideo.mutate({ playlistId: playlist.id, videoId });
		}
	};

	return (
		<Button
			disabled={isPending}
			variant='ghost'
			className='w-full justify-start px-2 disabled:opacity-100 [&_svg]:size-5'
			size='lg'
			onClick={handleAction}
		>
			{isPending ? (
				<Loader2Icon className='animate-spin' />
			) : playlist.containsVideo ? (
				<SquareCheckIcon />
			) : (
				<SquareIcon />
			)}
			{playlist.name}
		</Button>
	);
};
