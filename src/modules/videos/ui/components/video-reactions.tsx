import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// TODO: Implement video reactions
export const VideoReactions = () => {
	const viewerReaction: string = 'like';

	return (
		<div className='flex flex-none items-center'>
			<Button className='gap-2 rounded-l-full rounded-r-none pr-4' variant='secondary'>
				<ThumbsUpIcon className={cn('size-5', viewerReaction === 'like' && 'fill-black')} />
				{10}
				<span className='sr-only'>Likes</span>
			</Button>

			<Separator orientation='vertical' className='h-7' />

			<Button className='rounded-l-none rounded-r-full pl-3' variant='secondary'>
				<ThumbsDownIcon className={cn('size-5', viewerReaction === 'dislike' && 'fill-black')} />
				{1}
				<span className='sr-only'>Dislikes</span>
			</Button>
		</div>
	);
};
