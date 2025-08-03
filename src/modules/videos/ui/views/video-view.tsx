import { CommentsSection } from '@/modules/videos/ui/sections/comments-section';
import { SuggestionsSection } from '@/modules/videos/ui/sections/suggestions-section';
import { VideoSection } from '@/modules/videos/ui/sections/video-section';

interface VideoViewProps {
	videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
	return (
		<div className='mx-auto mb-10 flex max-w-[1700px] flex-col p-2.5 px-4'>
			<div className='flex flex-col gap-6 xl:flex-row'>
				<div className='min-w-0 flex-1'>
					<VideoSection videoId={videoId} />

					<div className='mt-4 block xl:hidden'>
						<SuggestionsSection videoId={videoId} isManual />
					</div>

					<CommentsSection videoId={videoId} />
				</div>

				<div className='hidden w-full shrink xl:block xl:w-[380px] 2xl:w-[460px]'>
					<SuggestionsSection videoId={videoId} />
				</div>
			</div>
		</div>
	);
};
