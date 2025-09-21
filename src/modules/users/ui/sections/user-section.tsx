'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { UserPageBanner } from '@/modules/users/ui/components/user-page-banner';
import { UserPageInfo } from '@/modules/users/ui/components/user-page-info';

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
			<UserPageBanner user={user} />
			<UserPageInfo user={user} />
		</div>
	);
};
