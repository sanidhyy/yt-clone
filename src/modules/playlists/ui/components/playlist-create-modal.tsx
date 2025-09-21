import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { playlistCreateSchema } from '@/modules/playlists/schemas/playlist-create-schema';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/trpc/client';

interface PlaylistCreateModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export const PlaylistCreateModal = ({ onOpenChange, open }: PlaylistCreateModalProps) => {
	const utils = trpc.useUtils();

	const form = useForm<z.infer<typeof playlistCreateSchema>>({
		defaultValues: {
			name: '',
		},
		resolver: zodResolver(playlistCreateSchema),
	});

	const create = trpc.playlists.create.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to create playlist!');
		},
		onSuccess: () => {
			form.reset();
			onOpenChange(false);
			toast.success('Playlist created!');

			utils.playlists.getMany.invalidate();
		},
	});

	const onSubmit = async (values: z.infer<typeof playlistCreateSchema>) => {
		create.mutate(values);
	};

	const isPending = create.isPending;

	return (
		<ResponsiveModal
			title='Create a playlist'
			description='Get started by creating a playlist and add videos to it.'
			open={open || isPending}
			onOpenChange={onOpenChange}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4' autoComplete='off'>
					<FormField
						disabled={isPending}
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>

								<FormControl>
									<Input {...field} placeholder='My favorite videos' />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex justify-end'>
						<Button type='submit' disabled={isPending} isLoading={isPending}>
							Create
						</Button>
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	);
};
