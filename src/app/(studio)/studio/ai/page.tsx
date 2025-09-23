import { cookies } from 'next/headers';

import { OPENAI_API_KEY_COOKIE_NAME } from '@/modules/studio/constants';
import { AISettingsView } from '@/modules/studio/ui/views/ai-settings-view';

import { decrypt } from '@/lib/encryption';

const AISettingsPage = async () => {
	const cookieStore = await cookies();

	const apiKey = cookieStore.get(OPENAI_API_KEY_COOKIE_NAME)?.value.trim() || '';

	return <AISettingsView apiKey={decrypt(apiKey)} />;
};
export default AISettingsPage;
