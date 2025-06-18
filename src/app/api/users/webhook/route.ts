import { NextRequest, NextResponse } from 'next/server';

import { verifyWebhook, type WebhookEvent } from '@clerk/nextjs/webhooks';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { env } from '@/env/server';

export async function POST(req: NextRequest) {
	let evt: WebhookEvent;

	try {
		evt = await verifyWebhook(req, { signingSecret: env.CLERK_WEBHOOK_SECRET });
	} catch (err) {
		console.error('Error verifying webhook:', err);
		return new NextResponse('Error verifying webhook', { status: 400 });
	}

	const eventType = evt.type;

	switch (eventType) {
		case 'user.created':
		case 'user.updated': {
			const data = evt.data;
			const name =
				`${data.first_name || ''} ${data.last_name || ''}`.trim() ||
				data.username ||
				data.email_addresses[0].email_address?.split('@')?.[0]?.trim() ||
				'User';
			const imageUrl = data.image_url;

			await db
				.insert(users)
				.values({
					clerkId: data.id,
					imageUrl,
					name,
				})
				.onConflictDoUpdate({
					set: { imageUrl, name },
					target: users.clerkId,
				});
			break;
		}
		case 'user.deleted': {
			const data = evt.data;

			if (!data.id) {
				return new NextResponse('Missing user id', { status: 400 });
			}

			await db.delete(users).where(eq(users.clerkId, data.id));
		}
		default:
			console.warn('Unhandled event: ', evt);
	}

	return new NextResponse('Webhook received', { status: 200 });
}
