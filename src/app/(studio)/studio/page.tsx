import { StudioView } from '@/modules/studio/ui/views/studio-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

const StudioPage = async () => {
	void trpc.studio.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<StudioView />
		</HydrateClient>
	);
};
export default StudioPage;
