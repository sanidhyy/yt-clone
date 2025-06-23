import { VideoView } from '@/modules/studio/ui/views/video-view';

import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface VideoIdPageProps {
	params: Promise<{ videoId: string }>;
}

const VideoIdPage = async ({ params }: VideoIdPageProps) => {
	const { videoId } = await params;

	void trpc.studio.getOne.prefetch({ id: videoId });

	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	);
};

export default VideoIdPage;
