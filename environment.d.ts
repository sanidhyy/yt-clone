// This file is needed to support autocomplete for process.env
export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// app base url
			NEXT_PUBLIC_APP_BASE_URL: string;

			// clerk api keys
			NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
			CLERK_SECRET_KEY: string;

			// clerk webhook
			CLERK_WEBHOOK_SECRET: string;

			// clerk redirect urls
			NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
			NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
			NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string;
			NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string;

			// neon db uri
			DATABASE_URL: string;

			// upstash redis url and token
			UPSTASH_REDIS_REST_URL: string;
			UPSTASH_REDIS_REST_TOKEN: string;

			// mux image base url
			NEXT_PUBLIC_MUX_IMAGE_BASE_URL: string;

			// mux token and webhook secret
			MUX_TOKEN_ID: string;
			MUX_TOKEN_SECRET: string;
			MUX_WEBHOOK_SECRET: string;

			// uploadthing app id and token
			UPLOADTHING_APP_ID: string;
			UPLOADTHING_TOKEN: string;
		}
	}
}
