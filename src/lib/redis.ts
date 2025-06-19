import { Redis } from '@upstash/redis';

import { env } from '@/env/server';

export const redis = new Redis({
	token: env.UPSTASH_REDIS_REST_TOKEN,
	url: env.UPSTASH_REDIS_REST_URL,
});
