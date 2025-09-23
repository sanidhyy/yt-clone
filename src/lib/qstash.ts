import { Client } from '@upstash/workflow';

import { env } from '@/env/server';

export const qstash = new Client({
	token: env.QSTASH_TOKEN,
});
