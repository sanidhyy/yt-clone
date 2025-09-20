import { useClerk, useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod/v4';

import { CommentSchema } from '@/modules/comments/schema';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/user-avatar';
import { trpc } from '@/trpc/client';

interface CommentFormProps {
	videoId: string;
	onCancel?: () => void;
	onSuccess?: () => void;
	parentId?: string;
	variant?: 'comment' | 'reply';
}

export const CommentForm = ({ videoId, onCancel, onSuccess, parentId, variant = 'comment' }: CommentFormProps) => {
	const clerk = useClerk();
	const { user } = useUser();
	const utils = trpc.useUtils();

	const create = trpc.comments.create.useMutation({
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to add a comment!');
			}
		},
		onSuccess: () => {
			utils.comments.getMany.invalidate({ videoId }); // Comments
			utils.comments.getMany.invalidate({ parentId, videoId }); // Replies
			form.reset();
			toast.success('Comment added!');
			onSuccess?.();
		},
	});

	const form = useForm<z.infer<typeof CommentSchema>>({
		defaultValues: {
			parentId,
			value: '',
			videoId,
		},
		resolver: zodResolver(CommentSchema),
	});

	const handleCancel = () => {
		form.reset();
		onCancel?.();
	};

	const handleSubmit = (values: z.infer<typeof CommentSchema>) => {
		create.mutate(values);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Check for both Windows (event.ctrlKey) and macOS (event.metaKey) Command key
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			form.handleSubmit(handleSubmit)();
		}
	};

	const isReply = variant === 'reply';

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className='group flex gap-4'>
				<UserAvatar
					size={isReply ? 'default' : 'lg'}
					imageUrl={user?.imageUrl || '/user-placeholder.svg'}
					name={user?.fullName || 'User'}
				/>

				<div className='flex-1'>
					<FormField
						disabled={create.isPending}
						control={form.control}
						name='value'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder={isReply ? 'Reply to this comment...' : 'Add a comment...'}
										className='min-h-0 resize-none overflow-hidden bg-transparent'
										onKeyDown={handleKeyDown}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='mt-2 flex justify-end gap-2'>
						{!!onCancel && (
							<Button variant='ghost' type='button' size='sm' disabled={create.isPending} onClick={handleCancel}>
								Cancel
							</Button>
						)}
						<Button isLoading={create.isPending} disabled={create.isPending} type='submit' size='sm'>
							{isReply ? 'Reply' : 'Comment'}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
