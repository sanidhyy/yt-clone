import { FormSection } from '@/modules/studio/ui/sections/form-section';

interface VideoViewProps {
	videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
	return (
		<div className='max-w-(--breakpoint-lg) px-4 pt-2.5'>
			<FormSection videoId={videoId} />
		</div>
	);
};
