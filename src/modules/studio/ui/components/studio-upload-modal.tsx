'use client';

import { PlusIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
		<Button
			variant='secondary'
			disabled={create.isPending}
			isLoading={create.isPending}
			onClick={() => create.mutate()}
		>
			<PlusIcon />
			Create
		</Button>
	);
};
