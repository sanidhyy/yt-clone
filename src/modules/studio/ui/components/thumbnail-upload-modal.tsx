import { useState } from 'react';

import { TRPCError } from '@trpc/server';

import { ResponsiveModal } from '@/components/responsive-modal';
import { UploadDropzone } from '@/lib/uploadthing';
import { trpc } from '@/trpc/client';

interface ThumbnailUploadModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	videoId: string;
}

export const ThumbnailUploadModal = ({ onOpenChange, open, videoId }: ThumbnailUploadModalProps) => {
	const [isUploading, setIsUploading] = useState(false);
	const utils = trpc.useUtils();

	const onUploadComplete = () => {
		utils.studio.getMany.invalidate();
		utils.studio.getOne.invalidate({ id: videoId });
		setIsUploading(false);
		onOpenChange(false);
	};

	return (
		<ResponsiveModal
			title='Upload a thumbnail'
			description='Get started by uploading new thumbnail for your video.'
			open={open || isUploading}
			onOpenChange={onOpenChange}
		>
			<UploadDropzone
				endpoint='thumbnailUploader'
				input={{ videoId }}
				onUploadBegin={(files) => {
					setIsUploading(true);
					return files;
				}}
				onBeforeUploadBegin={(files) => {
					const file = files?.[0];
					if (!file) throw new TRPCError({ code: 'NOT_FOUND', message: 'Image to upload not found!' });

					const blob = file.slice(0, file.size, file.type);
					const extension = file.name.split('.').at(-1);

					const fileName = `${crypto.randomUUID()}.${extension}`;
					const newFile = new File([blob], fileName, { type: file.type });

					return [newFile];
				}}
				onClientUploadComplete={onUploadComplete}
				onUploadAborted={() => setIsUploading(false)}
				onUploadError={() => setIsUploading(false)}
			/>
		</ResponsiveModal>
	);
};
