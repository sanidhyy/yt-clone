import MuxUploader, {
	MuxUploaderDrop,
	MuxUploaderFileSelect,
	MuxUploaderProgress,
	MuxUploaderStatus,
} from '@mux/mux-uploader-react';

interface StudioUploaderProps {
	endpoint?: string | null;
	onSuccess: () => void;
}

export const StudioUploader = ({ onSuccess, endpoint }: StudioUploaderProps) => {
	return (
		<div>
			<MuxUploader endpoint={endpoint} />
		</div>
	);
};
