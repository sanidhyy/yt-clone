/* eslint-disable sort-keys */

import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable(
	'user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		clerkId: text('clerk_id').notNull().unique(),

		name: text('name').notNull(),
		imageUrl: text('image_url').notNull(),
		// TODO: Add banner url

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(user) => [uniqueIndex('clerk_id_idx').on(user.clerkId)]
);

export const usersRelations = relations(users, ({ many }) => ({
	videos: many(videos),
}));

export const categories = pgTable(
	'category',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull().unique(),
		description: text('description'),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(category) => [uniqueIndex('name_idx').on(category.name)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	videos: many(videos),
}));

export const videos = pgTable('video', {
	id: uuid('id').primaryKey().defaultRandom(),

	title: text('title').notNull(),
	description: text('description'),

	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	userId: uuid('user_id')
		.references(() => users.id, {
			onDelete: 'cascade',
		})
		.notNull(),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt')
		.notNull()
		.$onUpdate(() => new Date()),
});

export const videosRelations = relations(videos, ({ one }) => ({
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
}));
