'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { UserBanner } from '@/modules/users/ui/components/user-banner';

import { trpc } from '@/trpc/client';

interface UserSectionProps {
	userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<UserSectionSuspense userId={userId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
	const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

	return (
		<div className='flex flex-col'>
			<UserBanner user={user} />
		</div>
	);
};
