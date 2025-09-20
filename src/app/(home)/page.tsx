import { HomeView } from '@/modules/home/ui/views/home-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface HomePageProps {
	searchParams: Promise<{
		categoryId?: string;
	}>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
	const { categoryId } = await searchParams;

	void trpc.categories.getMany.prefetch();
	void trpc.videos.getMany.prefetchInfinite({ categoryId, limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<HomeView categoryId={categoryId} />
		</HydrateClient>
	);
};

export default HomePage;
