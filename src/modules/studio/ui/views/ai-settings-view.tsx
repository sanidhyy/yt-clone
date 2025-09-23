import { AISettingsForm } from '@/modules/studio/ui/components/ai-settings-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AISettingsViewProps {
	apiKey: string;
}

export const AISettingsView = ({ apiKey }: AISettingsViewProps) => {
	return (
		<div className='flex size-full flex-col items-center justify-center p-2'>
			<Card className='w-full max-w-lg'>
				<CardHeader>
					<CardTitle>AI Settings</CardTitle>
					<CardDescription>Manage AI settings for generating content for your videos.</CardDescription>
				</CardHeader>

				<CardContent>
					<AISettingsForm apiKey={apiKey} />
				</CardContent>
			</Card>
		</div>
	);
};
