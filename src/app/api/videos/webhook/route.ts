import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

import { updateVideoAsset } from '@/modules/videos/server/actions';

import { NOT_FOUND, OK } from '@/config/http-status-codes';
import { db } from '@/db';
import { MuxStatus, videos } from '@/db/schema';
import { mux } from '@/lib/mux';

export const POST = async (req: NextRequest) => {
	const headersList = await headers();
	const body = await req.text();

	const event = await mux.webhooks.unwrap(body, headersList);

	switch (event.type) {
		case 'video.asset.created': {
			const data = event.data;

			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			const existingReadyVideoCount = await db.$count(
				videos,
				and(eq(videos.muxAssetId, data.id), eq(videos.muxStatus, MuxStatus.READY))
			);

			if (!existingReadyVideoCount) {
				await db
					.update(videos)
					.set({
						muxAssetId: data.id,
						muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
							? (data.status as MuxStatus)
							: MuxStatus.CANCELLED,
					})
					.where(eq(videos.muxUploadId, data.upload_id));
			}

			break;
		}
		case 'video.asset.ready': {
			const data = event.data;
			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			await updateVideoAsset(data.upload_id);

			break;
		}
		case 'video.asset.errored': {
			const data = event.data;
			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			await db
				.update(videos)
				.set({
					muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
						? (data.status as MuxStatus)
						: MuxStatus.CANCELLED,
				})
				.where(eq(videos.muxUploadId, data.upload_id));

			break;
		}
		case 'video.asset.deleted': {
			const data = event.data;
			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			const utapi = new UTApi();

			const [removedVideo] = await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id)).returning();

			if (!!removedVideo) {
				if (removedVideo.thumbnailKey) await utapi.deleteFiles(removedVideo.thumbnailKey);
				if (removedVideo.previewKey) await utapi.deleteFiles(removedVideo.previewKey);
			}

			break;
		}
		case 'video.asset.track.ready': {
			const data = event.data;

			const assetId = data.asset_id;

			if (!assetId) {
				return new NextResponse('No asset id found!', { status: NOT_FOUND });
			}

			await db
				.update(videos)
				.set({
					muxTrackId: data.id,
					muxTrackStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
						? (data.status as MuxStatus)
						: MuxStatus.CANCELLED,
				})
				.where(eq(videos.muxAssetId, assetId));

			break;
		}
		default:
			console.warn('Unhandled event: ', event);
	}

	return new NextResponse('Webhook received!', { status: OK });
};
