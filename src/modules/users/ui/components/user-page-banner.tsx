import { useState } from 'react';

import { useAuth } from '@clerk/nextjs';
import { Edit2Icon } from 'lucide-react';

import type { UserGetOneOutput } from '@/modules/users/types';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { BannerUploadModal } from './banner-upload-modal';

export const UserPageBannerSkeleton = () => {
	return <Skeleton className='h-[15vh] max-h-[200px] w-full md:h-[25vh]' />;
};

interface UserPageBannerProps {
	user: UserGetOneOutput;
}

export const UserPageBanner = ({ user }: UserPageBannerProps) => {
	const { userId } = useAuth();

	const [isBannerUploadModalOpen, setIsBannerUploadModalOpen] = useState(false);

	return (
		<div className='group relative'>
			<BannerUploadModal open={isBannerUploadModalOpen} onOpenChange={setIsBannerUploadModalOpen} userId={user.id} />

			<div
				className={cn(
					'h-[15vh] max-h-[200px] w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 md:h-[25vh]',
					user.bannerUrl ? 'bg-cover bg-center' : 'bg-gray-100'
				)}
				style={{
					backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined,
				}}
			>
				{user.clerkId === userId && (
					<Button
						type='button'
						size='icon'
						className='absolute right-4 top-4 rounded-full bg-black/50 opacity-100 transition-opacity duration-300 hover:bg-black/50 group-hover:opacity-100 md:opacity-0'
						onClick={() => setIsBannerUploadModalOpen(true)}
					>
						<Edit2Icon className='size-4 text-white' />
						<span className='sr-only'>Edit Banner</span>
					</Button>
				)}
			</div>
		</div>
	);
};
