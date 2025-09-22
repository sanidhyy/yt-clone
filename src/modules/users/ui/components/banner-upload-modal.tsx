import { useState } from 'react';

import { TRPCError } from '@trpc/server';
import toast from 'react-hot-toast';

import { ResponsiveModal } from '@/components/responsive-modal';
import { UploadDropzone } from '@/lib/uploadthing';
import { trpc } from '@/trpc/client';

interface BannerUploadModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	userId: string;
}

export const BannerUploadModal = ({ onOpenChange, open, userId }: BannerUploadModalProps) => {
	const [isUploading, setIsUploading] = useState(false);
	const utils = trpc.useUtils();

	const onUploadComplete = () => {
		utils.users.getOne.invalidate({ id: userId });
		setIsUploading(false);
		onOpenChange(false);
	};

	return (
		<ResponsiveModal
			title='Upload a banner'
			description='Get started by uploading new banner for your channel.'
			open={open || isUploading}
			onOpenChange={onOpenChange}
		>
			<UploadDropzone
				endpoint='bannerUploader'
				appearance={{
					button: 'bg-primary ut-ready:bg-primary ut-uploading:bg-primary after:bg-gray-700',
					container: 'cursor-pointer',
				}}
				onUploadBegin={(files) => {
					setIsUploading(true);
					return files;
				}}
				onBeforeUploadBegin={(files) => {
					const file = files?.[0];
					if (!file) throw new TRPCError({ code: 'NOT_FOUND', message: 'Image to upload not found!' });

					if (file.size > 4 * 1024 * 1024) {
						toast.error('File size exceeds 4MB!');
						throw new TRPCError({ code: 'BAD_REQUEST', message: 'Image size exceeds 4MB!' });
					}

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
