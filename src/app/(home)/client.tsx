'use client';

import { trpc } from '@/trpc/client';

export const HomeClient = () => {
	const [data] = trpc.categories.getMany.useSuspenseQuery();

	return <pre className='w-screen overflow-auto whitespace-pre-wrap'>{JSON.stringify(data)}</pre>;
};
