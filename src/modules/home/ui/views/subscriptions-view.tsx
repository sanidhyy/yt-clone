import { SubscriptionsVideosSection } from '@/modules/home/ui/sections/subscriptions-videos-section';

export const SubscriptionsView = () => {
	return (
		<div className='mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5'>
			<div>
				<h1 className='text-2xl font-bold'>Subscriptions</h1>
				<p className='text-xl text-muted-foreground'>Videos from your favorite creators</p>
			</div>

			<SubscriptionsVideosSection />
		</div>
	);
};
