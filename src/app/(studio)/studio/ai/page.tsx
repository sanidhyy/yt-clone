import { cookies } from 'next/headers';

import { AISettingsView } from '@/modules/studio/ui/views/ai-settings-view';

import { env } from '@/env/server';
import { decrypt } from '@/lib/encryption';
import { getSecureCookieName } from '@/lib/utils';

const AISettingsPage = async () => {
	const cookieStore = await cookies();

	const apiKey = cookieStore.get(getSecureCookieName(env.OPENAI_API_KEY_COOKIE_NAME))?.value.trim() || '';

	return <AISettingsView apiKey={decrypt(apiKey)} />;
};

export default AISettingsPage;
