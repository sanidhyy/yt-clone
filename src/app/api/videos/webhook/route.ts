import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
} from '@mux/mux-node/resources/webhooks';
import { eq } from 'drizzle-orm';

import { BAD_REQUEST, NOT_FOUND, OK } from '@/config/http-status-codes';
import { db } from '@/db';
import { MuxStatus, videos } from '@/db/schema';
import { env as envClient } from '@/env/client';
import { env } from '@/env/server';
import { mux } from '@/lib/mux';

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetTrackReadyWebhookEvent;

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

			const playbackId = data.playback_ids?.[0].id;
			if (!playbackId) {
				return new NextResponse('No playback id found!', { status: NOT_FOUND });
			}

			const previewUrl = `${envClient.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${playbackId}/animated.gif`;
			const thumbnailUrl = `${envClient.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${playbackId}/thumbnail.jpg`;

			const duration = data.duration ? Math.round(data.duration * 1000) : 0;

			await db
				.update(videos)
				.set({
					duration,
					muxAssetId: data.id,
					muxPlaybackId: playbackId,
					muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
						? (data.status as MuxStatus)
						: MuxStatus.CANCELLED,
					previewUrl,
					thumbnailUrl,
				})
				.where(eq(videos.muxUploadId, data.upload_id));

			break;
		}
	}

	return new NextResponse('Webhook received', { status: OK });
};
