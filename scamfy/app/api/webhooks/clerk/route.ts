import { Webhook } from "svix";
import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  const webhookSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ||
    process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET.");
    return NextResponse.json(
      { error: "ConfigurationError", message: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  // Get Svix headers from Request object directly
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing webhook signature headers." },
      { status: 400 }
    );
  }

  const body = await req.text();

  let unverifiedPayload: unknown;
  try {
    const wh = new Webhook(webhookSecret);
    unverifiedPayload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Clerk Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "InvalidSignature", message: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  if (!isValidWebhookPayload(unverifiedPayload)) {
    return NextResponse.json(
      { error: "InvalidPayload", message: "Malformed or invalid event payload structure." },
      { status: 400 }
    );
  }

  const evt = unverifiedPayload;
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
