import { MoreVerticalIcon, ShareIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { absoluteUrl } from '@/lib/utils';

interface PlaylistInfoProps {
	id: string;
	name: string;
	onRemove: () => void;
	isPending: boolean;
}

export const PlaylistInfoSkeleton = () => {
	return (
		<div className='flex gap-3'>
			<div className='min-w-0 flex-1 space-y-2'>
				<Skeleton className='h-5 w-[90%]' />
				<Skeleton className='h-5 w-[70%]' />
				<Skeleton className='h-5 w-1/2' />
			</div>
		</div>
	);
};

export const PlaylistInfo = ({ id, name, onRemove, isPending }: PlaylistInfoProps) => {
	const fullUrl = absoluteUrl(`/playlists/${id}`);

	const handleSharePlaylist = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);

			toast.success('Link copied to the copied!');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to copy video url!');
		}
	};

	return (
		<div className='flex items-center justify-between gap-3'>
			<div className='min-w-0 flex-1'>
				<h3 className='line-clamp-1 break-words text-sm font-medium lg:line-clamp-2'>{name}</h3>

				<p className='text-sm font-semibold text-muted-foreground hover:text-primary'>View full playlist</p>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger disabled={isPending} asChild>
					<Button variant='ghost' size='icon' className='size-8'>
						<MoreVerticalIcon />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end'>
					<DropdownMenuItem
						disabled={isPending}
						onClick={(e) => {
							e.stopPropagation();

							handleSharePlaylist();
						}}
					>
						<ShareIcon className='size-4' />
						Share
					</DropdownMenuItem>

					<DropdownMenuItem
						disabled={isPending}
						onClick={(e) => {
							e.stopPropagation();

							onRemove();
						}}
						variant='destructive'
					>
						<Trash2Icon className='size-4' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
