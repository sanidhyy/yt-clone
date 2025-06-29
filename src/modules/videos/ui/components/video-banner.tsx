import { AlertTriangleIcon } from 'lucide-react';

import type { VideoGetOneOutput } from '@/modules/videos/types';

import { MuxStatus } from '@/db/schema';

interface VideoBannerProps {
	status: VideoGetOneOutput['muxStatus'];
}

export const VideoBanner = ({ status }: VideoBannerProps) => {
	if (status === MuxStatus.READY) return null;

	return (
		<div className='flex items-center gap-2 rounded-b-xl bg-yellow-400 px-4 py-3'>
			<AlertTriangleIcon className='size-4 shrink-0 text-black' />

			<p className='line-clamp-1 text-xs font-medium text-black md:text-sm'>
				This video is still being processed.{' '}
				<span className='hidden sm:inline'>Video quality may improve once processing is complete.</span>
			</p>
		</div>
	);
};
