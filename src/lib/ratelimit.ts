import { Ratelimit } from '@upstash/ratelimit';

import { redis } from './redis';

export const ratelimit = new Ratelimit({
	limiter: Ratelimit.slidingWindow(10, '10 s'),
	redis,
});
