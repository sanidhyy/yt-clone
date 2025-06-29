import { Client } from '@upstash/workflow';

export const qstash = new Client({
	token: process.env.QSTASH_TOKEN,
});
