import MuxUploader, {
	MuxUploaderDrop,
	MuxUploaderFileSelect,
	MuxUploaderProgress,
	MuxUploaderStatus,
} from '@mux/mux-uploader-react';
import { UploadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StudioUploaderProps {
	endpoint?: string | null;
	onSuccess: () => void;
}

const MUX_UPLOADER_ID = 'video-uploader';

export const StudioUploader = ({ onSuccess, endpoint }: StudioUploaderProps) => {
	return (
		<div>
			<MuxUploader onSuccess={onSuccess} id={MUX_UPLOADER_ID} endpoint={endpoint} className='group/uploader hidden' />
			<MuxUploaderDrop muxUploader={MUX_UPLOADER_ID} className='group/drop'>
				<div slot='heading' className='flex flex-col items-center gap-6'>
					<div className='flex size-32 items-center justify-center gap-2 rounded-full bg-muted'>
						<UploadIcon className='size-10 text-muted-foreground transition-all duration-300 group-[[active]]/drop:animate-bounce' />
					</div>

					<div className='flex flex-col gap-2 text-center'>
						<p className='text-sm'>Drag & Drop video files to upload</p>
						<p className='text-xs text-muted-foreground'>
							Your videos will be trimmed to 10 seconds and auto-deleted after 24 hours due to Mux free plan limits.
						</p>
					</div>

					<MuxUploaderFileSelect muxUploader={MUX_UPLOADER_ID}>
						<Button type='button' className='rounded-full'>
							Select files
						</Button>
					</MuxUploaderFileSelect>
				</div>

				<span slot='separator' className='hidden' />

				<MuxUploaderStatus muxUploader={MUX_UPLOADER_ID} className='text-sm' />
				<MuxUploaderProgress muxUploader={MUX_UPLOADER_ID} className='text-sm' type='percentage' />
				<MuxUploaderProgress muxUploader={MUX_UPLOADER_ID} type='bar' />
			</MuxUploaderDrop>
		</div>
	);
};
