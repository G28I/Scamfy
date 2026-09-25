import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from './prisma';

describe('Prisma PostgreSQL Schema & Domain Integration Tests', () => {
  beforeEach(async () => {
    // Clean tables in reverse dependency order before each test
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "audit_events" CASCADE;');
    await prisma.caseSupportGrant.deleteMany();
    await prisma.caseEvidence.deleteMany();
    await prisma.caseTimelineEvent.deleteMany();
    await prisma.victimCase.deleteMany();
    await prisma.communityReport.deleteMany();
    await prisma.scamPattern.deleteMany();
    await prisma.scamCheck.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('enforces User creation, role defaults, and unique clerkUserId constraint', async () => {
    const user = await prisma.user.create({
      data: {
        clerkUserId: 'user_clerk_12345',
        email: 'student@campus.edu',
        role: 'student_user',
        collegeDomain: 'campus.edu',
      },
    });

    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('string');
    expect(user.clerkUserId).toBe('user_clerk_12345');
    expect(user.role).toBe('student_user');
    expect(user.createdAt).toBeInstanceOf(Date);

    // Duplicate clerkUserId must be rejected with Prisma P2002 error
    await expect(
      prisma.user.create({
        data: {
          clerkUserId: 'user_clerk_12345',
          email: 'duplicate@campus.edu',
        },
      })
    ).rejects.toThrow(/Unique constraint failed/);
  });

  it('creates anonymous and authenticated ScamCheck records with JSON signals and telemetry', async () => {
    // 1. Anonymous ScamCheck
    const anonCheck = await prisma.scamCheck.create({
      data: {
        userId: null,
        inputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        overallRisk: 'HIGH_RISK',
        primaryCategory: 'Digital Arrest / Law Enforcement Impersonation',
        secondaryCategories: ['Sextortion & Coercion'],
        signals: [
          {
            rule_id: 'IMPERSONATION_POLICE',
            severity: 'CRITICAL',
            matched_text: 'CBI arrest warrant',
            weight: 0.95,
          },
        ],
        extractedEntities: {
          phone_numbers: ['+919876543210'],
          upi_ids: ['fraud@okaxis'],
          urls: ['http://fake-police-court.in'],
        },
        modelMetadata: {
          model_slug: 'nvidia/llama-3.1-nemotron-70b-instruct',
          prompt_version: 'v1.2',
          temperature: 0.1,
        },
        actionRecommendations: ['Do not transfer funds', 'Report immediately to 1930'],
      },
    });

    expect(anonCheck.id).toBeDefined();
    expect(anonCheck.userId).toBeNull();
    expect(anonCheck.overallRisk).toBe('HIGH_RISK');
    expect(Array.isArray(anonCheck.signals)).toBe(true);

    // 2. Authenticated ScamCheck linked to a User
    const authUser = await prisma.user.create({
      data: {
        clerkUserId: 'user_clerk_auth_check_01',
        role: 'student_user',
      },
    });

    const authCheck = await prisma.scamCheck.create({
      data: {
        userId: authUser.id,
        inputHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        overallRisk: 'CAUTION',
        primaryCategory: 'Part-Time Job / Task Scam',
        signals: [],
        extractedEntities: { telegram_handles: ['@task_recruiter_bot'] },
        modelMetadata: { model_slug: 'nvidia/llama-3.1-nemotron-70b-instruct' },
        actionRecommendations: ['Verify employer on MCA registry'],
      },
    });

    expect(authCheck.userId).toBe(authUser.id);
  });

  it('enforces ScamPattern composite unique constraint on (indicatorType, indicatorValue) per REP-03', async () => {
    const pattern = await prisma.scamPattern.create({
      data: {
        indicatorType: 'UPI_ID',
        indicatorValue: 'suspicious.mule@ybl',
        category: 'Money-Mule / Task Scam',
        riskLevel: 'CRITICAL',
        verificationStatus: 'MODERATOR_VERIFIED',
        reportCount: 1,
        metadataPayload: { mule_bank: 'Yes Bank', channel: 'Telegram' },
      },
    });

    expect(pattern.id).toBeDefined();
    expect(pattern.indicatorValue).toBe('suspicious.mule@ybl');

    // Duplicate (indicatorType, indicatorValue) insertion must throw unique constraint violation (REP-03)
    await expect(
      prisma.scamPattern.create({
        data: {
          indicatorType: 'UPI_ID',
          indicatorValue: 'suspicious.mule@ybl',
          category: 'Duplicate Submission',
          riskLevel: 'HIGH',
        },
      })
    ).rejects.toThrow(/Unique constraint failed/);

    // Link a CommunityReport to this verified pattern
    const reporter = await prisma.user.create({
      data: { clerkUserId: 'user_reporter_001' },
    });

    const report = await prisma.communityReport.create({
      data: {
        reporterUserId: reporter.id,
        patternId: pattern.id,
        indicatorType: 'UPI_ID',
        indicatorValue: 'suspicious.mule@ybl',
        category: 'Money-Mule / Task Scam',
        description: 'Asked to receive and redirect INR 50,000.',
        status: 'APPROVED',
        moderatorNotes: 'Verified against national blacklist.',
      },
    });

    expect(report.patternId).toBe(pattern.id);
  });

  it('enforces User -> VictimCase -> Evidence, Timeline, & SupportGrant ownership chain and cascades', async () => {
    const victim = await prisma.user.create({
      data: { clerkUserId: 'user_victim_999', role: 'student_user' },
    });
    const moderator = await prisma.user.create({
      data: { clerkUserId: 'user_moderator_777', role: 'moderator' },
    });

    const victimCase = await prisma.victimCase.create({
      data: {
        userId: victim.id,
        title: 'Digital Arrest Extortion Incident',
        category: 'Digital Arrest / Law Enforcement Impersonation',
        financialLossAmount: '150000.00',
        currency: 'INR',
        status: 'OPEN',
        officialComplaintAckNo: 'ACK-1930-2026-987654',
      },
    });

    const timelineEvent = await prisma.caseTimelineEvent.create({
      data: {
        caseId: victimCase.id,
        eventTimestamp: new Date(),
        eventType: 'PAYMENT_SENT',
        description: 'Transferred 1.5 Lakh via RTGS under Skype coercion.',
        amount: '150000.00',
        counterpartyIdentifier: 'HDFC0001234 / 50100234567890',
      },
    });

    const evidence = await prisma.caseEvidence.create({
      data: {
        caseId: victimCase.id,
        fileKey: `evidence/${victimCase.id}/bank_receipt_01.pdf`,
        fileName: 'bank_receipt_01.pdf',
        fileSizeBytes: BigInt(245890),
        contentType: 'application/pdf',
        sha256Checksum: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        magicSignatureVerified: true,
      },
    });

    const grant = await prisma.caseSupportGrant.create({
      data: {
        caseId: victimCase.id,
        grantedByUserId: victim.id,
        granteeUserId: moderator.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        revokedAt: null,
        rationale: 'Assistance with 1930 cybercrime filing',
      },
    });

    expect(timelineEvent.caseId).toBe(victimCase.id);
    expect(evidence.caseId).toBe(victimCase.id);
    expect(grant.grantedByUserId).toBe(victim.id);
    expect(grant.granteeUserId).toBe(moderator.id);

    // Test explicit revocation
    const revokedGrant = await prisma.caseSupportGrant.update({
      where: { id: grant.id },
      data: { revokedAt: new Date() },
    });
    expect(revokedGrant.revokedAt).toBeInstanceOf(Date);

    // Test cascading deletion
    await prisma.victimCase.delete({
      where: { id: victimCase.id },
    });

    const remainingEvidence = await prisma.caseEvidence.findUnique({ where: { id: evidence.id } });
    const remainingTimeline = await prisma.caseTimelineEvent.findUnique({ where: { id: timelineEvent.id } });
    const remainingGrant = await prisma.caseSupportGrant.findUnique({ where: { id: grant.id } });

    expect(remainingEvidence).toBeNull();
    expect(remainingTimeline).toBeNull();
    expect(remainingGrant).toBeNull();
  });

  it('enforces AuditEvent append-only logging at Prisma Client and PostgreSQL trigger boundary (SEC-06)', async () => {
    const auditEntry = await prisma.auditEvent.create({
      data: {
        actorId: 'user_mod_alpha',
        actorRole: 'moderator',
        action: 'SUPPORT_ACCESS_CASE',
        targetResourceType: 'victim_case',
        targetResourceId: 'case_uuid_placeholder_777',
        details: {
          grant_duration_minutes: 15,
          rationale: 'User requested 1930 escalation support',
          granted_by_user: true,
        },
        ipAddressHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      },
    });

    expect(auditEntry.id).toBeDefined();
    expect(auditEntry.action).toBe('SUPPORT_ACCESS_CASE');

    // 1. Prisma Client extension prevents update operations
    await expect(
      prisma.auditEvent.update({
        where: { id: auditEntry.id },
        data: { action: 'MUTATED_ACTION' },
      })
    ).rejects.toThrow(/AuditEvent is append-only: update operations are prohibited/);

    // 2. Prisma Client extension prevents delete operations
    await expect(
      prisma.auditEvent.delete({
        where: { id: auditEntry.id },
      })
    ).rejects.toThrow(/AuditEvent is append-only: delete operations are prohibited/);

    // 3. PostgreSQL database trigger prevents raw SQL UPDATE
    await expect(
      prisma.$executeRawUnsafe(
        `UPDATE audit_events SET action = 'TAMPERED_SQL' WHERE id = '${auditEntry.id}'::uuid;`
      )
    ).rejects.toThrow(/audit_events is an append-only table/);

    // 4. PostgreSQL database trigger prevents raw SQL DELETE
    await expect(
      prisma.$executeRawUnsafe(
        `DELETE FROM audit_events WHERE id = '${auditEntry.id}'::uuid;`
      )
    ).rejects.toThrow(/audit_events is an append-only table/);
  });
});
