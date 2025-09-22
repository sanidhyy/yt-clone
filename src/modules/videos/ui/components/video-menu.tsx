import { useState } from 'react';

import { useClerk } from '@clerk/nextjs';
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

import { PlaylistAddModal } from '@/modules/playlists/ui/components/playlist-add-modal';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/hooks/use-confirm';
import { absoluteUrl } from '@/lib/utils';

interface VideoMenuProps {
	videoId: string;
	onRemove?: () => void;
	variant?: 'ghost' | 'secondary';
}

export const VideoMenu = ({ videoId, onRemove, variant = 'ghost' }: VideoMenuProps) => {
	const { loaded, user, openSignIn } = useClerk();

	const [ConfirmDialog, confirm] = useConfirm({
		message: 'Are you sure you want to remove this video from playlist? This action cannot be undone.',
		title: 'Remove video from playlist',
	});

	const [openPlaylistAddModal, setOpenPlaylistAddModal] = useState(false);

	const fullUrl = absoluteUrl(`/videos/${videoId}`);

	const onShare = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);

			toast.success('Link copied to the copied!');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to copy video url!');
		}
	};

	const handleOpenPlaylistAddModal = () => {
		if (loaded && !user) return openSignIn();

		setOpenPlaylistAddModal(true);
	};

	const handleRemove = async () => {
		if (!onRemove) return;

		const ok = await confirm();
		if (!ok) return;

		onRemove();
	};

	return (
		<>
			<ConfirmDialog />

			<PlaylistAddModal open={openPlaylistAddModal} onOpenChange={setOpenPlaylistAddModal} videoId={videoId} />

			<DropdownMenu>
				<DropdownMenuTrigger disabled={!loaded} asChild>
					<Button variant={variant} size='icon' className='rounded-full'>
						<MoreVerticalIcon />
						<span className='sr-only'>More {!!onRemove ? 'playlist' : 'video'} options</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={onShare}>
						<ShareIcon className='size-4' />
						Share
					</DropdownMenuItem>

					<DropdownMenuItem onClick={handleOpenPlaylistAddModal}>
						<ListPlusIcon className='size-4' />
						Add to playlist
					</DropdownMenuItem>

					{/* TODO: Add confirm delete dialog */}
					{!!onRemove && (
						<DropdownMenuItem onClick={handleRemove} variant='destructive'>
							<Trash2Icon className='size-4' />
							Remove
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
