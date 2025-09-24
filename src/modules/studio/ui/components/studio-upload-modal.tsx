'use client';

import { useRouter } from 'next/navigation';

import { Loader2Icon, PlusIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';

import { StudioUploader } from './studio-uploader';

export const StudioUploadModal = () => {
	const router = useRouter();
	const utils = trpc.useUtils();

	const create = trpc.videos.create.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to create video!');
		},
		onSuccess: () => {
			utils.studio.getMany.invalidate();
		},
	});

	const onSuccess = () => {
		if (!create.data?.video.id) return;

		create.reset();
		router.push(`/studio/videos/${create.data.video.id}`);
	};

	return (
		<>
			<ResponsiveModal
				title='Upload a video'
				description='Upload a video to your studio'
				open={!!create.data}
				onOpenChange={() => create.reset()}
			>
				{create.data?.url ? (
					<StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
				) : (
					<Loader2Icon className='size-5 animate-spin' aria-label='Loading video...' strokeWidth={2.5} />
				)}
			</ResponsiveModal>

			<Button
				disabled={create.isPending}
				isLoading={create.isPending}
				onClick={() => create.mutate()}
				className='gap-1'
			>
				<PlusIcon strokeWidth={2.1} />
				<span className='hidden md:inline'>Create</span>
			</Button>
		</>
	);
};
