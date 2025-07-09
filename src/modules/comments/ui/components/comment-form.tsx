import { useClerk, useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod/v4';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/user-avatar';
import { CommentInsertSchema } from '@/db/schema';
import { trpc } from '@/trpc/client';

interface CommentFormProps {
	videoId: string;
	onSuccess?: () => void;
}

const CommentSchema = CommentInsertSchema.omit({ userId: true }).extend({
	value: z.string().trim().min(2, 'Comment is too short!'),
});

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
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
			utils.comments.getMany.invalidate({ videoId });
			form.reset();
			toast.success('Comment added!');
			onSuccess?.();
		},
	});

	const form = useForm<z.infer<typeof CommentSchema>>({
		defaultValues: {
			value: '',
			videoId,
		},
		resolver: zodResolver(CommentSchema),
	});

	const handleSubmit = (values: z.infer<typeof CommentSchema>) => {
		create.mutate(values);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className='group flex gap-4'>
				<UserAvatar size='lg' imageUrl={user?.imageUrl || '/user-placeholder.svg'} name={user?.fullName || 'User'} />

				<div className='flex-1'>
					<FormField
						control={form.control}
						name='value'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder='Add a comment...'
										className='min-h-0 resize-none overflow-hidden bg-transparent'
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='mt-2 flex justify-end gap-2'>
						<Button isLoading={create.isPending} disabled={create.isPending} type='submit' size='sm'>
							Comment
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
