'use server';

import type { Asset, Upload } from '@mux/mux-node/resources/video';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

import { db } from '@/db';
import { MuxStatus, videos } from '@/db/schema';
import { env as envClient } from '@/env/client';
import { mux } from '@/lib/mux';

export const updateVideoAsset = async (muxUploadId: string) => {
	const [existingVideo] = await db.select().from(videos).where(eq(videos.muxUploadId, muxUploadId));
	if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

	if (existingVideo.muxStatus === MuxStatus.READY) return existingVideo;

	let upload: Upload | undefined = undefined;

	try {
		upload = await mux.video.uploads.retrieve(muxUploadId);
	} catch {}

	// const upload = await mux.video.uploads.retrieve(muxUploadId);
	if (!upload || !upload.asset_id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mux upload not found!' });

	let asset: Asset | undefined = undefined;

	try {
		asset = await mux.video.assets.retrieve(upload.asset_id);
	} catch {}
	if (!asset) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mux asset not found!' });

	const utapi = new UTApi();

	const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;
	const muxPlaybackId = asset.playback_ids?.[0]?.id;
	const muxStatus = Object.values(MuxStatus).includes(asset.status as MuxStatus)
		? (asset.status as MuxStatus)
		: MuxStatus.CANCELLED;

	const muxPreviewUrl = `${envClient.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${muxPlaybackId}/animated.gif`;
	const muxThumbnailUrl = `${envClient.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${muxPlaybackId}/thumbnail.jpg`;

	const [uploadedPreview, uploadedThumbnail] = await utapi.uploadFilesFromUrl([muxPreviewUrl, muxThumbnailUrl]);

	if (!uploadedPreview.data || !uploadedThumbnail.data)
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload preview or thumbnai!' });

	const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;
	const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

	const [updatedVideo] = await db
		.update(videos)
		.set({
			duration,
			muxAssetId: asset.id,
			muxPlaybackId,
			muxStatus,
			previewKey,
			previewUrl,
			thumbnailKey,
			thumbnailUrl,
		})
		.where(eq(videos.muxUploadId, muxUploadId))
		.returning();

	return updatedVideo;
};
