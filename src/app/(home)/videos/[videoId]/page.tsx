import { VideoView } from '@/modules/videos/ui/views/video-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface VideoIdPageProps {
	params: Promise<{
		videoId: string;
	}>;
}

const VideoIdPage = async ({ params }: VideoIdPageProps) => {
	const { videoId } = await params;

	void trpc.videos.getOne.prefetch({ id: videoId });
	// TODO: update to infinite prefetch
	void trpc.comments.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT, videoId });
	void trpc.suggestions.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT, videoId });

	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	);
};
export default VideoIdPage;
