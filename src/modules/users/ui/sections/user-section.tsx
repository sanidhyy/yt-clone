'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { UserPageBanner, UserPageBannerSkeleton } from '@/modules/users/ui/components/user-page-banner';
import { UserPageInfo, UserPageInfoSkeleton } from '@/modules/users/ui/components/user-page-info';

import { Separator } from '@/components/ui/separator';
import { trpc } from '@/trpc/client';

interface UserSectionProps {
	userId: string;
}

const UserSectionSkeleton = () => {
	return (
		<div className='flex flex-col'>
			<UserPageBannerSkeleton />
			<UserPageInfoSkeleton />
			<Separator />
		</div>
	);
};

export const UserSection = ({ userId }: UserSectionProps) => {
	return (
		<Suspense fallback={<UserSectionSkeleton />}>
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
			<Separator />
		</div>
	);
};
