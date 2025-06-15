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
		}
	}
}
