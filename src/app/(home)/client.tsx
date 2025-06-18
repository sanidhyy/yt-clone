'use client';

import { trpc } from '@/trpc/client';

export const HomeClient = () => {
	const [data] = trpc.hello.useSuspenseQuery({ text: 'John!' });

	return <div>Home Client: {JSON.stringify(data)}</div>;
};
