import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

interface ClerkWebhookEmailAddress {
  email_address: string;
}

interface ClerkWebhookUserEventData {
  id: string;
  email_addresses?: ClerkWebhookEmailAddress[];
}

interface ClerkWebhookPayload {
  type: string;
  data: ClerkWebhookUserEventData;
}

export async function POST(req: Request) {
  const webhookSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ||
    process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret && process.env.NODE_ENV === "production") {
    console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET in production.");
    return NextResponse.json(
      { error: "ConfigurationError", message: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  // Get Svix headers from Request object directly
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  const body = await req.text();

  let evt: ClerkWebhookPayload;

  if (webhookSecret && svixId && svixTimestamp && svixSignature) {
    const wh = new Webhook(webhookSecret);
    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as unknown as ClerkWebhookPayload;
    } catch (err) {
      console.error("Clerk Webhook verification failed:", err);
      return NextResponse.json(
        { error: "InvalidSignature", message: "Webhook signature verification failed." },
        { status: 400 }
      );
    }
  } else {
    // Fail closed in production if signature headers are missing
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing webhook signature headers." },
        { status: 400 }
      );
    }

    try {
      evt = JSON.parse(body) as ClerkWebhookPayload;
    } catch {
      return NextResponse.json(
        { error: "InvalidPayload", message: "Malformed JSON body." },
        { status: 400 }
      );
    }
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address || null;

    if (id) {
      await prisma.user.upsert({
        where: { clerkUserId: id },
        update: {
          ...(email ? { email } : {}),
        },
        create: {
          clerkUserId: id,
          email,
          role: UserRole.student_user, // Default unprivileged role
        },
      });
    }
  }

  return NextResponse.json({ success: true, event: eventType }, { status: 200 });
}
