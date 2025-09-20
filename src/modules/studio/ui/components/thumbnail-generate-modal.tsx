import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { thumbnailGenerateSchema } from '@/modules/studio/schemas/thumbnail-generate-schema';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/client';

interface ThumbnailGenerateModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	videoId: string;
}

export const ThumbnailGenerateModal = ({ onOpenChange, open, videoId }: ThumbnailGenerateModalProps) => {
	const form = useForm<z.infer<typeof thumbnailGenerateSchema>>({
		defaultValues: {
			prompt: '',
		},
		resolver: zodResolver(thumbnailGenerateSchema),
	});

	const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to generate video thumbnail!');
		},
		onSuccess: () => {
			form.reset();
			onOpenChange(false);
			toast('Generating Video thumbnail...\nThis may take some time.', {
				icon: <CheckCircle2Icon className='size-6 text-primary' />,
			});
		},
	});

	const onSubmit = async (values: z.infer<typeof thumbnailGenerateSchema>) => {
		generateThumbnail.mutate({
			id: videoId,
			prompt: values.prompt,
		});
	};

	const isPending = generateThumbnail.isPending;

	return (
		<ResponsiveModal
			title='Upload a thumbnail'
			description='Get started by uploading new thumbnail for your video.'
			open={open || isPending}
			onOpenChange={onOpenChange}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4' autoComplete='off'>
					<FormField
						disabled={isPending}
						control={form.control}
						name='prompt'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Prompt</FormLabel>

								<FormControl>
									<Textarea
										{...field}
										className='resize-none'
										cols={30}
										rows={5}
										placeholder='A description of wanted thumbnail...'
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex justify-end'>
						<Button type='submit' disabled={isPending} isLoading={isPending}>
							Generate
						</Button>
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	);
};
