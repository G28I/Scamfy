import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

interface ClerkWebhookEmailAddress {
  id?: string;
  email_address?: string;
}

interface ClerkWebhookUserEventData {
  id: string;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkWebhookEmailAddress[];
}

interface ClerkWebhookPayload {
  type: string;
  data: ClerkWebhookUserEventData;
}

function isValidUserEventData(data: unknown): data is ClerkWebhookUserEventData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.id === "string" && d.id.trim().length > 0;
}

function isValidWebhookPayload(payload: unknown): payload is ClerkWebhookPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (typeof p.type !== "string" || !p.type) return false;
  if (!p.data || typeof p.data !== "object") return false;
  return true;
}

export async function POST(req: NextRequest | Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET.");
    return NextResponse.json(
      { error: "ConfigurationError", message: "Webhook signing secret not configured." },
      { status: 500 }
    );
  }

  // Svix signature header guard
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing webhook signature headers." },
      { status: 400 }
    );
  }

  let verifiedPayload: unknown;
  try {
    verifiedPayload = await verifyWebhook(req as never, { signingSecret });
  } catch (err) {
    console.error("Clerk Webhook verification failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { error: "InvalidSignature", message: "Webhook verification failed." },
      { status: 400 }
    );
  }

  if (!isValidWebhookPayload(verifiedPayload)) {
    return NextResponse.json(
      { error: "InvalidPayload", message: "Malformed or invalid event payload structure." },
      { status: 400 }
    );
  }

  const evt = verifiedPayload;
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    if (!isValidUserEventData(evt.data)) {
      return NextResponse.json(
        { error: "InvalidPayload", message: "User event missing required id field." },
        { status: 400 }
      );
    }

    const { id, primary_email_address_id, email_addresses } = evt.data;
    const primaryEntry = email_addresses?.find((e) => e.id && e.id === primary_email_address_id);
    const email = primaryEntry?.email_address || email_addresses?.[0]?.email_address || null;

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

  return NextResponse.json({ success: true, event: eventType }, { status: 200 });
}
