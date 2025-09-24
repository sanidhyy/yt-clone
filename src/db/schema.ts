/* eslint-disable sort-keys */

import { relations } from 'drizzle-orm';
import { foreignKey, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const enumToPgEnum = <T extends Record<string, unknown>>(myEnum: T): [T[keyof T], ...T[keyof T][]] => {
	return Object.values(myEnum).map((value: unknown) => `${value}`) as never;
};

export enum ReactionType {
	LIKE = 'like',
	DISLIKE = 'dislike',
}

export const users = pgTable(
	'user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		clerkId: text('clerk_id').notNull().unique(),

		name: text('name').notNull(),
		imageUrl: text('image_url').notNull(),
		bannerUrl: text('banner_url'),
		bannerKey: text('banner_key'),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(user) => [uniqueIndex('clerk_id_idx').on(user.clerkId)]
);

export const usersRelations = relations(users, ({ many }) => ({
	comments: many(comments),
	commentReactions: many(commentReactions),
	videos: many(videos),
	videoViews: many(videoViews),
	videoReactions: many(videoReactions),
	subscriptions: many(subscriptions, {
		relationName: 'subscription_viewer_id_fkey',
	}),
	subscribers: many(subscriptions, {
		relationName: 'subscription_creator_id_fkey',
	}),
	playlists: many(playlists),
}));

export const subscriptions = pgTable(
	'subscription',
	{
		viewerId: uuid('viewer_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		creatorId: uuid('creator_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(subscription) => [
		primaryKey({
			name: 'subscription_pk',
			columns: [subscription.viewerId, subscription.creatorId],
		}),
	]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	creator: one(users, {
		fields: [subscriptions.creatorId],
		references: [users.id],
		relationName: 'subscription_creator_id_fkey',
	}),
	viewer: one(users, {
		fields: [subscriptions.viewerId],
		references: [users.id],
		relationName: 'subscription_viewer_id_fkey',
	}),
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

export const playlistVideos = pgTable(
	'playlist_video',
	{
		playlistId: uuid('playlist_id')
			.notNull()
			.references(() => playlists.id, { onDelete: 'cascade' }),
		videoId: uuid('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(playlistVideo) => [
		primaryKey({
			name: 'playlist_video_pk',
			columns: [playlistVideo.playlistId, playlistVideo.videoId],
		}),
	]
);

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
	playlist: one(playlists, {
		fields: [playlistVideos.playlistId],
		references: [playlists.id],
	}),
	video: one(videos, {
		fields: [playlistVideos.videoId],
		references: [videos.id],
	}),
}));

export const playlists = pgTable('playlist', {
	id: uuid('id').primaryKey().defaultRandom(),

	name: text('name').notNull(),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.$onUpdate(() => new Date()),
});

export const playlistsRelations = relations(playlists, ({ many, one }) => ({
	user: one(users, {
		fields: [playlists.userId],
		references: [users.id],
	}),
	playlistVideos: many(playlistVideos),
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
	comments: many(comments),
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	views: many(videoViews),
	reactions: many(videoReactions),
	playlistVideos: many(playlistVideos),
}));

export const comments = pgTable(
	'comment',
	{
		id: uuid('id').primaryKey().defaultRandom(),

		parentId: uuid('parent_id'),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		videoId: uuid('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),

		value: text('value').notNull(),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(comment) => [
		foreignKey({
			columns: [comment.parentId],
			foreignColumns: [comment.id],
			name: 'comment_parent_id_fk',
		}).onDelete('cascade'),
	]
);

export const commentsRelations = relations(comments, ({ many, one }) => ({
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'comment_parent_id_fk',
	}),
	reactions: many(commentReactions),
	replies: many(comments, {
		relationName: 'comment_parent_id_fk',
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
	video: one(videos, {
		fields: [comments.videoId],
		references: [videos.id],
	}),
}));

export const CommentInsertSchema = createInsertSchema(comments);
export const CommentSelectSchema = createSelectSchema(comments);
export const CommentUpdateSchema = createUpdateSchema(comments);

export const commentReactions = pgTable(
	'comment_reaction',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		commentId: uuid('comment_id')
			.notNull()
			.references(() => comments.id, { onDelete: 'cascade' }),

		type: text('type', { enum: enumToPgEnum(ReactionType) }).notNull(),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(commentReaction) => [
		primaryKey({
			name: 'comment_reaction_pk',
			columns: [commentReaction.userId, commentReaction.commentId],
		}),
	]
);

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
	user: one(users, {
		fields: [commentReactions.userId],
		references: [users.id],
	}),
	comment: one(comments, {
		fields: [commentReactions.commentId],
		references: [comments.id],
	}),
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
	user: one(users, {
		fields: [videoViews.userId],
		references: [users.id],
	}),
	video: one(videos, {
		fields: [videoViews.videoId],
		references: [videos.id],
	}),
}));

export const VideoViewInsertSchema = createInsertSchema(videoViews);
export const VideoViewSelectSchema = createSelectSchema(videoViews);
export const VideoViewUpdateSchema = createUpdateSchema(videoViews);

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
	(videoReaction) => [
		primaryKey({
			name: 'video_reaction_pk',
			columns: [videoReaction.userId, videoReaction.videoId],
		}),
	]
);

export const videoReactionsRelations = relations(videoReactions, ({ one }) => ({
	user: one(users, {
		fields: [videoReactions.userId],
		references: [users.id],
	}),
	video: one(videos, {
		fields: [videoReactions.videoId],
		references: [videos.id],
	}),
}));

export const VideoReactionInsertSchema = createInsertSchema(videoReactions);
export const VideoReactionSelectSchema = createSelectSchema(videoReactions);
export const VideoReactionUpdateSchema = createUpdateSchema(videoReactions);
