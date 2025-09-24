import { createEnv } from '@t3-oss/env-nextjs';
import { vercel } from '@t3-oss/env-nextjs/presets-zod';
import { z } from 'zod';

export const env = createEnv({
	emptyStringAsUndefined: true,
	// eslint-disable-next-line camelcase
	experimental__runtimeEnv: process.env,
	extends: [vercel()],
	onInvalidAccess: (variable: string) => {
		console.error('❌ Attempted to access a server-side environment variable on the client: ', variable);
		throw new Error('❌ Attempted to access a server-side environment variable on the client');
	},
	onValidationError: (issues) => {
		console.error('❌ Invalid environment variables:', issues);

		throw new Error('❌ Invalid environment variables');
	},
	server: {
		CLERK_SECRET_KEY: z.string().trim().min(1),
		CLERK_WEBHOOK_SECRET: z.string().trim().min(1),
		DATABASE_URL: z.string().url(),
		MUX_TOKEN_ID: z.string().trim().min(1),
		MUX_TOKEN_SECRET: z.string().trim().min(1),
		MUX_WEBHOOK_SECRET: z.string().trim().min(1),
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development').optional(),
		OPENAI_API_BASE_URL: z.string().url(),
		OPENAI_API_KEY_COOKIE_NAME: z.string().min(1),
		QSTASH_CURRENT_SIGNING_KEY: z.string().trim().min(1).startsWith('sig_'),
		QSTASH_NEXT_SIGNING_KEY: z.string().trim().min(1).startsWith('sig_'),
		QSTASH_TOKEN: z.string().trim().min(1),
		UPLOADTHING_APP_ID: z.string().trim().min(1),
		UPLOADTHING_TOKEN: z.string().trim().min(1),
		UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(1),
		UPSTASH_REDIS_REST_URL: z.string().url(),
		UPSTASH_WORKFLOW_URL: z.string().url(),
		VERIFICATION_SECRET: z.string().min(1),
	},
});
