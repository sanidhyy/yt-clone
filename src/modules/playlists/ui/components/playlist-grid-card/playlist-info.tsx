import { Skeleton } from '@/components/ui/skeleton';

interface PlaylistInfoProps {
	name: string;
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

export const PlaylistInfo = ({ name }: PlaylistInfoProps) => {
	return (
		<div className='flex gap-3'>
			<div className='min-w-0 flex-1'>
				<h3 className='line-clamp-1 break-words text-sm font-medium lg:line-clamp-2'>{name}</h3>

				<p className='text-sm text-muted-foreground'>Playlist</p>
				<p className='text-sm font-semibold text-muted-foreground hover:text-primary'>View full playlist</p>
			</div>
		</div>
	);
};
