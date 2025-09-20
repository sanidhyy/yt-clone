import { z } from 'zod';

export const playlistCreateSchema = z.object({
	name: z.string().trim().min(1, 'Playlist name is required.'),
});
