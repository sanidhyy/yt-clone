/* eslint-disable sort-keys */

import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable(
	'user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		clerkId: text('clerk_id').notNull().unique(),

		name: text('name').notNull(),
		imageUrl: text('image_url').notNull(),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(user) => [uniqueIndex('clerk_id_idx').on(user.clerkId)]
);
