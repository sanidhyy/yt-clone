'use client';

import { PlusIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';

export const StudioUploadModal = () => {
	const utils = trpc.useUtils();
	const create = trpc.videos.create.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to create video!');
		},
		onSuccess: () => {
			toast.success('Video created!');
			utils.studio.getMany.invalidate();
		},
	});

	return (
		<>
			<ResponsiveModal
				title='Upload a video'
				description='Upload a video to your studio'
				open={!!create.data}
				onOpenChange={() => create.reset()}
			>
				<p>This will be an uploader.</p>
			</ResponsiveModal>

			<Button
				variant='secondary'
				disabled={create.isPending}
				isLoading={create.isPending}
				onClick={() => create.mutate()}
			>
				<PlusIcon />
				Create
			</Button>
		</>
	);
};
