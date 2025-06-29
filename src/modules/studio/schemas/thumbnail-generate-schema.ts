import { z } from 'zod';

export const thumbnailGenerateSchema = z.object({
	prompt: z.string().trim().min(10, 'Prompt must contain atleast 10 characters.'),
});
