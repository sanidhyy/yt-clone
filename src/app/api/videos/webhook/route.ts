import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetDeletedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
} from '@mux/mux-node/resources/webhooks';
import { eq } from 'drizzle-orm';

import { updateVideoAsset } from '@/modules/videos/server/actions';

import { BAD_REQUEST, NOT_FOUND, OK } from '@/config/http-status-codes';
import { db } from '@/db';
import { MuxStatus, videos } from '@/db/schema';
import { env } from '@/env/server';
import { mux } from '@/lib/mux';

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetTrackReadyWebhookEvent
	| VideoAssetDeletedWebhookEvent;

export const POST = async (req: NextRequest) => {
	const MUX_SIGNATURE_HEADER_NAME = 'Mux-Signature';

	const headerPayload = await headers();
	const muxSignature = headerPayload.get(MUX_SIGNATURE_HEADER_NAME);

	if (!muxSignature) {
		return new NextResponse('Failed to verify signature!', { status: BAD_REQUEST });
	}

	const payload = await req.json();
	const body = JSON.stringify(payload);
	const signingSecret = env.MUX_WEBHOOK_SECRET;

	mux.webhooks.verifySignature(
		body,
		{
			[MUX_SIGNATURE_HEADER_NAME]: muxSignature,
		},
		signingSecret
	);

	switch (payload.type as WebhookEvent['type']) {
		case 'video.asset.created': {
			const data = payload.data as VideoAssetCreatedWebhookEvent['data'];

			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			await db
				.update(videos)
				.set({
					muxAssetId: data.id,
					muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
						? (data.status as MuxStatus)
						: MuxStatus.CANCELLED,
				})
				.where(eq(videos.muxUploadId, data.upload_id));

			break;
		}
		case 'video.asset.ready': {
			const data = payload.data as VideoAssetReadyWebhookEvent['data'];
			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			await updateVideoAsset(data.upload_id);

			break;
		}
		case 'video.asset.errored': {
			const data = payload.data as VideoAssetErroredWebhookEvent['data'];
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
			const data = payload.data as VideoAssetDeletedWebhookEvent['data'];
			if (!data.upload_id) {
				return new NextResponse('No upload id found!', { status: NOT_FOUND });
			}

			await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));

			break;
		}
		case 'video.asset.track.ready': {
			const data = payload.data as VideoAssetTrackReadyWebhookEvent['data'] & { asset_id: string };

			// Typescript incorrectly says that asset_id does not exist
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
			console.warn('Unhandled event: ', payload);
	}

	return new NextResponse('Webhook received!', { status: OK });
};
