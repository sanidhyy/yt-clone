import Link from 'next/link';

import { useAuth, useClerk } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

import { CommentsGetManyOutput } from '@/modules/comments/types';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { trpc } from '@/trpc/client';

interface CommentItemProps {
	comment: CommentsGetManyOutput['items'][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
	const utils = trpc.useUtils();
	const { userId } = useAuth();
	const clerk = useClerk();

	const remove = trpc.comments.remove.useMutation({
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to add comment to the video!');
			}
		},
		onSuccess: () => {
			toast.success('Comment deleted!');
			utils.comments.getMany.invalidate({ videoId: comment.videoId });
		},
	});

	return (
		<div>
			<div className='flex gap-4'>
				<Link href={`/users/${comment.userId}`}>
					<UserAvatar size='lg' imageUrl={comment.user.imageUrl} name={comment.user.name} />
				</Link>

				<div className='min-w-0 flex-1'>
					<Link href={`/users/${comment.userId}`}>
						<div className='mb-0.5 flex items-center gap-2'>
							<span className='pb-0.5 text-sm font-medium'>{comment.user.name}</span>
							<span className='text-xs text-muted-foreground'>
								{formatDistanceToNow(comment.updatedAt, {
									addSuffix: true,
								})}
							</span>
						</div>
					</Link>

					<p className='text-sm'>{comment.value}</p>
					{/* TODO: Reactions */}
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' size='icon' className='size-8'>
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align='end'>
						<DropdownMenuItem onClick={() => {}}>
							<MessageSquareIcon className='size-4' />
							Reply
						</DropdownMenuItem>

						{/* TODO: Add confirm delete dialog */}
						{comment.user.clerkId === userId && (
							<DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })} variant='destructive'>
								<Trash2Icon className='size-4' />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};
