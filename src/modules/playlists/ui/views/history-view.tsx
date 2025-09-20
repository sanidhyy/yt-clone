import { HistoryVideosSection } from '@/modules/playlists/ui/sections/history-videos-section';

export const HistoryView = () => {
	return (
		<div className='mx-auto mb-10 flex max-w-screen-md flex-col gap-y-6 px-4 pt-2.5'>
			<div>
				<h1 className='text-2xl font-bold'>History</h1>
				<p className='text-xl text-muted-foreground'>Videos you have watched</p>
			</div>

			<HistoryVideosSection />
		</div>
	);
};
