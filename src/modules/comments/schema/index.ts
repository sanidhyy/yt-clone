import { z } from 'zod/v4';

export const CommentSchema = z.object({
	parentId: z.uuid().nullish(),
	value: z.string().trim().min(2, 'Comment is too short!'),
	videoId: z.uuid(),
});
