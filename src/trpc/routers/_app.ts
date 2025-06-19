import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const appRouter = createTRPCRouter({
	hello: protectedProcedure
		.input(
			z.object({
				text: z.string(),
			})
		)
		.query((opts) => {
			console.log({ userId: opts.ctx.user });

			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
});

export type AppRouter = typeof appRouter;
