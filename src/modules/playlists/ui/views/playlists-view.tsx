'use client';

import { useState } from 'react';

import { PlusIcon } from 'lucide-react';

import { PlaylistCreateModal } from '@/modules/playlists/ui/components/playlist-create-modal';
import { PlaylistsSection } from '@/modules/playlists/ui/sections/playlists-section';

import { Button } from '@/components/ui/button';

export const PlaylistsView = () => {
	const [createModalOpen, setCreateModalOpen] = useState(false);

	return (
		<div className='mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5'>
			<PlaylistCreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Playlists</h1>
					<p className='text-xl text-muted-foreground'>Collections you have created</p>
				</div>

				<Button variant='outline' size='icon' className='rounded-full' onClick={() => setCreateModalOpen(true)}>
					<PlusIcon />
				</Button>
			</div>

			<PlaylistsSection />
		</div>
	);
};
