import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_CHANNELS,
  resolveReportingChannel,
  OfficialChannelId,
  FraudIncidentContext,
} from '@/lib/official-channels';

describe('Official Reporting Registry & Deterministic Router (OFF-01, OFF-02, OFF-03)', () => {
  describe('Official Channels Registry (OFFICIAL_CHANNELS)', () => {
    const requiredChannels: OfficialChannelId[] = [
      'CYBERCRIME_1930',
      'CHAKSHU_DOT',
      'RBI_SACHET',
      'SEBI_SCORES',
      'SEBI_MI_PORTAL',
      'BANK_FRAUD_DESK',
      'BANK_INTERNAL_GRIEVANCE',
      'RBI_OMBUDSMAN',
    ];

    it('contains all 8 distinct official channels with valid metadata', () => {
      for (const id of requiredChannels) {
        const channel = OFFICIAL_CHANNELS[id];
        expect(channel).toBeDefined();
        expect(channel.id).toBe(id);
        expect(channel.name.length).toBeGreaterThan(5);
        expect(channel.governingAgency.length).toBeGreaterThan(5);
        expect(channel.operatingHours.length).toBeGreaterThan(3);
        expect(channel.scope.length).toBeGreaterThan(15);
        expect(channel.acceptedIdentifiers.length).toBeGreaterThan(0);
        expect(channel.proceduralLimitations.length).toBeGreaterThan(0);
        expect(channel.regulatorySource.length).toBeGreaterThan(5);
      }
    });

    it('verifies 1930 channel documents CFCFRMS non-guarantee limitations and intake nature', () => {
      const channel = OFFICIAL_CHANNELS.CYBERCRIME_1930;
      expect(channel.helplineNumber).toBe('1930');
      expect(channel.proceduralLimitations.some((lim) => lim.includes('CFCFRMS'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.toLowerCase().includes('guarantee'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.includes('not automatically equivalent to FIR'))).toBe(true);
    });

    it('verifies Chakshu channel clearly states lack of bank recovery / FIR capabilities', () => {
      const channel = OFFICIAL_CHANNELS.CHAKSHU_DOT;
      expect(channel.category).toBe('TELECOM_INTELLIGENCE');
      expect(channel.proceduralLimitations.some((lim) => lim.includes('FIR'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.includes('1930'))).toBe(true);
    });

    it('verifies RBI Sachet channel documents multi-regulator intelligence scope', () => {
      const channel = OFFICIAL_CHANNELS.RBI_SACHET;
      expect(channel.category).toBe('REGULATORY_INTELLIGENCE');
      expect(channel.proceduralLimitations.some((lim) => lim.includes('coordination'))).toBe(true);
    });

    it('verifies SEBI SCORES 2.0 vs Market Intelligence Portal demarcation', () => {
      const scores = OFFICIAL_CHANNELS.SEBI_SCORES;
      const miPortal = OFFICIAL_CHANNELS.SEBI_MI_PORTAL;

      expect(scores.category).toBe('GRIEVANCE_REDRESSAL');
      expect(miPortal.category).toBe('REGULATORY_INTELLIGENCE');

      // SCORES requires registered entity
      expect(scores.proceduralLimitations.some((lim) => lim.includes('SEBI-registered'))).toBe(true);
      // MI Portal covers unregistered tips
      expect(miPortal.proceduralLimitations.some((lim) => lim.includes('intelligence'))).toBe(true);
    });

    it('verifies Bank Fraud Desk does NOT fabricate a generic bank URL and directs to physical card / official app details', () => {
      const channel = OFFICIAL_CHANNELS.BANK_FRAUD_DESK;
      expect(channel.officialUrl).toBeUndefined();
      expect(channel.officialContactGuidance).toBeDefined();
      expect(channel.officialContactGuidance).toContain('physical debit/credit card');
      expect(channel.officialContactGuidance).toContain('search engine ads');
      expect(channel.proceduralLimitations.some((lim) => lim.includes('RBI/2017-18/15'))).toBe(true);
    });

    it('verifies Bank Internal Grievance Desk requires formal dispute before Ombudsman escalation', () => {
      const channel = OFFICIAL_CHANNELS.BANK_INTERNAL_GRIEVANCE;
      expect(channel.officialUrl).toBeUndefined();
      expect(channel.officialContactGuidance).toBeDefined();
      expect(channel.proceduralLimitations.some((lim) => lim.toLowerCase().includes('prerequisite before escalating to the rbi ombudsman'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.includes('30 days, whichever is longer'))).toBe(true);
    });

    it('verifies RBI Ombudsman links to cms.rbi.org.in and explicitly states opening CMS is NOT a substitute for bank fraud desk', () => {
      const channel = OFFICIAL_CHANNELS.RBI_OMBUDSMAN;
      expect(channel.officialUrl).toBe('https://cms.rbi.org.in/');
      expect(channel.proceduralLimitations.some((lim) => lim.includes('NOT a substitute for immediately notifying your bank fraud team'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.includes('90 days'))).toBe(true);
      expect(channel.proceduralLimitations.some((lim) => lim.includes('RB-IOS 2026'))).toBe(true);
    });
  });

  describe('Deterministic Routing Engine — Complete Actions & Recency Analysis (OFF-02)', () => {
    const elapsedDurations = [0.5, 4, 24, 168]; // 30 min, 4 hours, 24 hours, 7 days

    it('asserts the complete set of 4 next actions across all elapsed durations without exception', () => {
      for (const hours of elapsedDurations) {
        const result = resolveReportingChannel({
          incidentType: 'UNAUTHORIZED_TRANSFER',
          hasFinancialLoss: true,
          financialLossAmount: 25000,
          elapsedHoursSinceLoss: hours,
        });

        // 1. Primary channel is always 1930
        expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');

        // 2. Complete sequence of 4 distinct next actions must be present
        expect(result.immediateActionSteps.length).toBe(4);

        // Action 1: Call 1930
        expect(result.immediateActionSteps[0]).toContain('1930');
        expect(result.immediateActionSteps[0]).toContain('CFCFRMS');

        // Action 2: Contact victim's own bank fraud desk immediately with UTR
        expect(result.immediateActionSteps[1]).toContain('bank 24x7 fraud desk');
        expect(result.immediateActionSteps[1]).toContain('UTR');

        // Action 3: Formalize on cybercrime.gov.in using 1930 SMS ticket ID
        expect(result.immediateActionSteps[2]).toContain('cybercrime.gov.in');
        expect(result.immediateActionSteps[2]).toContain('1930 SMS ticket');

        // Action 4: Submit formal written dispute to bank internal grievance desk
        expect(result.immediateActionSteps[3]).toContain('bank internal grievance desk');
        expect(result.immediateActionSteps[3]).toContain('UTR');

        // 3. Secondary channels must separate fraud desk, internal grievance, and Ombudsman
        expect(result.secondaryChannels.some((c) => c.id === 'BANK_FRAUD_DESK')).toBe(true);
        expect(result.secondaryChannels.some((c) => c.id === 'BANK_INTERNAL_GRIEVANCE')).toBe(true);
        expect(result.secondaryChannels.some((c) => c.id === 'RBI_OMBUDSMAN')).toBe(true);

        // 4. Rationale must never suggest abandoning immediate intervention
        expect(result.rationale).not.toContain('stop seeking');
        expect(result.rationale).toContain('mandatory primary route regardless of elapsed time');
        expect(result.rationale).toContain('cannot guarantee a freeze or recovery');
      }
    });

    it('distinguishes urgency level without implying fixed eligibility or funds-freeze cutoffs', () => {
      const recentResult = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        elapsedHoursSinceLoss: 0.5,
      });

      const delayedResult = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        elapsedHoursSinceLoss: 72,
      });

      expect(recentResult.urgencyLevel).toBe('EMERGENCY');
      expect(recentResult.rationale).toContain('within 4 hours');
      expect(delayedResult.urgencyLevel).toBe('HIGH');

      // Both retain 1930 and bank fraud desk instructions
      expect(recentResult.immediateActionSteps).toEqual(delayedResult.immediateActionSteps);

      // Delayed rationale explicitly states immediate reporting remains critical
      expect(delayedResult.rationale).toContain('immediate reporting remains critical');
      expect(delayedResult.rationale).not.toContain('FIR registration');
    });

    it('validates elapsedHoursSinceLoss and keeps unknown/invalid values eligible for EMERGENCY without claiming specific times', () => {
      // 1. Omitted / undefined elapsed time
      const undefinedElapsed = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
      });
      expect(undefinedElapsed.urgencyLevel).toBe('EMERGENCY');
      expect(undefinedElapsed.rationale).not.toContain('within 4 hours');
      expect(undefinedElapsed.rationale).toContain('Immediate reporting maximizes the opportunity for banks to act before funds are withdrawn');

      // 2. NaN elapsed time
      const nanElapsed = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        elapsedHoursSinceLoss: NaN,
      });
      expect(nanElapsed.urgencyLevel).toBe('EMERGENCY');
      expect(nanElapsed.rationale).not.toContain('within 4 hours');

      // 3. Negative elapsed time
      const negativeElapsed = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        elapsedHoursSinceLoss: -5,
      });
      expect(negativeElapsed.urgencyLevel).toBe('EMERGENCY');
      expect(negativeElapsed.rationale).not.toContain('within 4 hours');

      // 4. Valid non-negative <= 4 hours explicitly includes within 4 hours claim
      const validRecent = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        elapsedHoursSinceLoss: 3,
      });
      expect(validRecent.urgencyLevel).toBe('EMERGENCY');
      expect(validRecent.rationale).toContain('within 4 hours');
    });

    it('ensures universal caveats state that opening RBI CMS is NOT a substitute for notifying bank fraud team', () => {
      const result = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
      });

      expect(
        result.importantCaveats.some((c) =>
          c.includes('opening the RBI CMS is NOT a substitute for immediately alerting your bank fraud team')
        )
      ).toBe(true);
    });

    it('appends credential-sharing liability caveat when OTP/PIN was compromised', () => {
      const result = resolveReportingChannel({
        incidentType: 'UNAUTHORIZED_TRANSFER',
        hasFinancialLoss: true,
        hasPaymentCredentialsShared: true,
      });

      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.importantCaveats.some((c) => c.includes('RBI/2017-18/15'))).toBe(true);
      expect(result.importantCaveats.some((c) => c.includes('liability until reported'))).toBe(true);
    });
  });

  describe('Deterministic Routing Engine — Telecom Communications (DoT Chakshu)', () => {
    it('routes suspicious SMS without financial loss to Chakshu as primary', () => {
      const result = resolveReportingChannel({
        incidentType: 'TELECOM_PHISHING',
        hasFinancialLoss: false,
        deliveryChannel: 'SMS',
        identifiers: [{ type: 'PHONE', value: '9876543210' }],
      });

      expect(result.primaryChannel.id).toBe('CHAKSHU_DOT');
      expect(result.urgencyLevel).toBe('STANDARD');
      expect(result.secondaryChannels.some((c) => c.id === 'CYBERCRIME_1930')).toBe(true);
      expect(result.importantCaveats.some((c) => c.includes('telecom resource blocking'))).toBe(true);
    });

    it('routes suspicious WhatsApp call without financial loss to Chakshu', () => {
      const result = resolveReportingChannel({
        incidentType: 'TELECOM_PHISHING',
        hasFinancialLoss: false,
        deliveryChannel: 'WHATSAPP',
      });

      expect(result.primaryChannel.id).toBe('CHAKSHU_DOT');
    });

    it('escalates telecom fraud to 1930 when extortion or threats are present', () => {
      const result = resolveReportingChannel({
        incidentType: 'TELECOM_PHISHING',
        hasFinancialLoss: false,
        deliveryChannel: 'CALL',
        hasExtortionOrThreats: true,
      });

      // Extortion/threats constitutes criminal cyber offence -> 1930 primary
      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.urgencyLevel).toBe('HIGH');
    });
  });

  describe('Deterministic Routing Engine — Securities & Investment Scams (SEBI)', () => {
    it('routes complaints against registered intermediaries to SCORES 2.0 when no loss', () => {
      const result = resolveReportingChannel({
        incidentType: 'INVESTMENT_SCAM',
        hasFinancialLoss: false,
        isRegisteredEntity: true,
      });

      expect(result.primaryChannel.id).toBe('SEBI_SCORES');
      expect(result.rationale).toContain('SCORES 2.0');
    });

    it('routes suspected unregistered trading syndicates / Telegram groups to SEBI MI Portal', () => {
      const result = resolveReportingChannel({
        incidentType: 'INVESTMENT_SCAM',
        hasFinancialLoss: false,
        isRegisteredEntity: false,
        deliveryChannel: 'TELEGRAM',
      });

      expect(result.primaryChannel.id).toBe('SEBI_MI_PORTAL');
      expect(result.rationale).toContain('Market Intelligence');
    });

    it('preserves uncertainty and asks user to determine whether SCORES applies when isRegisteredEntity is omitted', () => {
      const result = resolveReportingChannel({
        incidentType: 'INVESTMENT_SCAM',
        hasFinancialLoss: false,
        deliveryChannel: 'TELEGRAM',
      });

      expect(result.isUncertain).toBe(true);
      expect(result.uncertaintyReason).toContain('SCORES');
      expect(result.rationale).toContain('Determine whether SCORES applies before selecting a SEBI route');
      expect(result.immediateActionSteps.some((step) => step.toLowerCase().includes('determine whether the intermediary holds a valid sebi registration'))).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'SEBI_SCORES')).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'CYBERCRIME_1930')).toBe(true);
    });

    it('routes investment scam WITH monetary loss to 1930 primary, with SEBI and separated bank channels', () => {
      const result = resolveReportingChannel({
        incidentType: 'INVESTMENT_SCAM',
        hasFinancialLoss: true,
        financialLossAmount: 200000,
        isRegisteredEntity: false,
      });

      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.secondaryChannels.some((c) => c.id === 'SEBI_MI_PORTAL')).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'BANK_FRAUD_DESK')).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'BANK_INTERNAL_GRIEVANCE')).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'RBI_OMBUDSMAN')).toBe(true);
    });
  });

  describe('Deterministic Routing Engine — Loan & Deposit Traps (RBI Sachet)', () => {
    it('routes suspected unregistered loan app promotion to RBI Sachet when no loss or threats', () => {
      const result = resolveReportingChannel({
        incidentType: 'LOAN_HARASSMENT',
        hasFinancialLoss: false,
        hasExtortionOrThreats: false,
      });

      expect(result.primaryChannel.id).toBe('RBI_SACHET');
      expect(result.rationale).toContain('Sachet');
    });

    it('routes loan app blackmail/extortion to 1930 primary due to criminal threat', () => {
      const result = resolveReportingChannel({
        incidentType: 'LOAN_HARASSMENT',
        hasFinancialLoss: false,
        hasExtortionOrThreats: true,
      });

      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.urgencyLevel).toBe('HIGH');
    });
  });

  describe('Deterministic Routing Engine — Digital Arrest & Impersonation', () => {
    it('routes digital arrest impersonation to 1930 with HIGH urgency and law enforcement disclaimers', () => {
      const result = resolveReportingChannel({
        incidentType: 'DIGITAL_ARREST',
        hasFinancialLoss: false,
        deliveryChannel: 'WHATSAPP',
      });

      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.urgencyLevel).toBe('HIGH');
      expect(result.immediateActionSteps.some((s) => s.includes('digital arrest'))).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'CHAKSHU_DOT')).toBe(true);
      expect(result.secondaryChannels.some((c) => c.id === 'BANK_FRAUD_DESK')).toBe(true);
    });
  });

  describe('Edge Cases, Missing Fields & Determinism', () => {
    it('handles undefined or malformed input safely without throwing', () => {
      // @ts-expect-error Testing invalid runtime input
      const resultNull = resolveReportingChannel(null);
      expect(resultNull.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(resultNull.isUncertain).toBe(true);

      // @ts-expect-error Testing empty object
      const resultEmpty = resolveReportingChannel({});
      expect(resultEmpty.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(resultEmpty.isUncertain).toBe(true);
    });

    it('marks ambiguous other incidents as uncertain and explains uncertainty', () => {
      const result = resolveReportingChannel({
        incidentType: 'OTHER',
        hasFinancialLoss: false,
      });

      expect(result.primaryChannel.id).toBe('CYBERCRIME_1930');
      expect(result.isUncertain).toBe(true);
      expect(result.uncertaintyReason).toBeDefined();
    });

    it('guarantees pure determinism: identical inputs produce identical outputs', () => {
      const input: FraudIncidentContext = {
        incidentType: 'INVESTMENT_SCAM',
        hasFinancialLoss: true,
        financialLossAmount: 75000,
        elapsedHoursSinceLoss: 1.5,
        deliveryChannel: 'WHATSAPP',
        isRegisteredEntity: false,
        hasPaymentCredentialsShared: false,
      };

      const run1 = resolveReportingChannel(input);
      const run2 = resolveReportingChannel(input);

      expect(run1).toEqual(run2);
    });
  });
});
