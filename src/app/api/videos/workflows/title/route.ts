import { serve } from '@upstash/workflow/nextjs';

export const { POST } = serve(async (context) => {
	await context.run('initial-step', () => {
		console.log('initial step ran');
	});

	await context.run('second-step', () => {
		console.log('second step ran');
	});
});
