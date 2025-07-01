/* eslint-disable sort-keys */

import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const enumToPgEnum = <T extends Record<string, unknown>>(myEnum: T): [T[keyof T], ...T[keyof T][]] => {
	return Object.values(myEnum).map((value: unknown) => `${value}`) as never;
};

export const users = pgTable(
	'user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		clerkId: text('clerk_id').notNull().unique(),

		name: text('name').notNull(),
		imageUrl: text('image_url').notNull(),
		// TODO: Add banner url

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(user) => [uniqueIndex('clerk_id_idx').on(user.clerkId)]
);

export const usersRelations = relations(users, ({ many }) => ({
	videos: many(videos),
	videoViews: many(videoViews),
	videoReactions: many(videoReactions),
}));

export const categories = pgTable(
	'category',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull().unique(),
		description: text('description'),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(category) => [uniqueIndex('name_idx').on(category.name)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	videos: many(videos),
}));

export enum MuxStatus {
	ASSET_CREATED = 'asset_created',
	CANCELLED = 'cancelled',
	ERRORED = 'errored',
	PREPARING = 'preparing',
	READY = 'ready',
	TIMED_OUT = 'timed_out',
	WAITING = 'waiting',
}

export enum VideoVisibility {
	PUBLIC = 'public',
	PRIVATE = 'private',
}

export const videos = pgTable('video', {
	id: uuid('id').primaryKey().defaultRandom(),

	title: text('title').notNull(),
	description: text('description'),
	thumbnailKey: text('thumbnail_key'),
	thumbnailUrl: text('thumbnail_url'),
	previewKey: text('preview_key'),
	previewUrl: text('preview_url'),
	duration: integer('duration').notNull().default(0),
	visibility: text('visibility', { enum: enumToPgEnum(VideoVisibility) })
		.notNull()
		.default(VideoVisibility.PRIVATE),

	muxStatus: text('mux_status', { enum: enumToPgEnum(MuxStatus) }),
	muxAssetId: text('mux_asset_id').unique(),
	muxUploadId: text('mux_upload_id').unique(),
	muxPlaybackId: text('mux_playback_id').unique(),
	muxTrackId: text('mux_track_id').unique(),
	muxTrackStatus: text('mux_track_status', { enum: enumToPgEnum(MuxStatus) }),

	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
		}),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.$onUpdate(() => new Date()),
});

export const VideoInsertSchema = createInsertSchema(videos);
export const VideoSelectSchema = createSelectSchema(videos);
export const VideoUpdateSchema = createUpdateSchema(videos);

export const videosRelations = relations(videos, ({ many, one }) => ({
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	views: many(videoViews),
	reactions: many(videoReactions),
}));

export const videoViews = pgTable(
	'video_view',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		videoId: uuid('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(videoView) => [
		primaryKey({
			name: 'video_view_pk',
			columns: [videoView.userId, videoView.videoId],
		}),
	]
);

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
	users: one(users, {
		fields: [videoViews.userId],
		references: [users.id],
	}),
	videos: one(videos, {
		fields: [videoViews.videoId],
		references: [videos.id],
	}),
}));

export const VideoViewInsertSchema = createInsertSchema(videoViews);
export const VideoViewSelectSchema = createSelectSchema(videoViews);
export const VideoViewUpdateSchema = createUpdateSchema(videoViews);

export enum ReactionType {
	LIKE = 'like',
	DISLIKE = 'dislike',
}

export const videoReactions = pgTable(
	'video_reaction',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		videoId: uuid('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),

		type: text('type', { enum: enumToPgEnum(ReactionType) }).notNull(),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(videoView) => [
		primaryKey({
			name: 'video_reaction_pk',
			columns: [videoView.userId, videoView.videoId],
		}),
	]
);

export const videoReactionsRelations = relations(videoReactions, ({ one }) => ({
	users: one(users, {
		fields: [videoReactions.userId],
		references: [users.id],
	}),
	videos: one(videos, {
		fields: [videoReactions.videoId],
		references: [videos.id],
	}),
}));

export const VideoReactionInsertSchema = createInsertSchema(videoReactions);
export const VideoReactionSelectSchema = createSelectSchema(videoReactions);
export const VideoReactionUpdateSchema = createUpdateSchema(videoReactions);
