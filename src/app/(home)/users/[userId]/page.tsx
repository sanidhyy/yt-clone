import { UserView } from '@/modules/users/ui/views/user-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

interface UserIdPageProps {
	params: Promise<{
		userId: string;
	}>;
}

const UserIdPage = async ({ params }: UserIdPageProps) => {
	const { userId } = await params;

	void trpc.users.getOne.prefetch({ id: userId });
	void trpc.videos.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT, userId });

	return (
		<HydrateClient>
			<UserView userId={userId} />
		</HydrateClient>
	);
};
export default UserIdPage;
