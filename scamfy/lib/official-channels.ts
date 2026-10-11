/**
 * Scamfy — Official Reporting Channels Registry & Deterministic Router
 *
 * Implements authoritative, source-backed directory of legitimate Indian fraud
 * reporting channels and deterministic routing logic (OFF-01, OFF-02, OFF-03).
 *
 * All channel references cite primary regulatory sources (I4C, DoT, RBI, SEBI).
 * Never promises fund recovery, legal innocence, or zero liability.
 */

export type OfficialChannelId =
  | 'CYBERCRIME_1930'
  | 'CHAKSHU_DOT'
  | 'RBI_SACHET'
  | 'SEBI_SCORES'
  | 'SEBI_MI_PORTAL'
  | 'BANK_FRAUD_DESK'
  | 'BANK_INTERNAL_GRIEVANCE'
  | 'RBI_OMBUDSMAN';

export type ChannelCategory =
  | 'CRIME_INVESTIGATION'
  | 'TELECOM_INTELLIGENCE'
  | 'REGULATORY_INTELLIGENCE'
  | 'GRIEVANCE_REDRESSAL';

export type IncidentCategory =
  | 'UNAUTHORIZED_TRANSFER'
  | 'INVESTMENT_SCAM'
  | 'LOAN_HARASSMENT'
  | 'DEPOSIT_SCHEME'
  | 'TELECOM_PHISHING'
  | 'DIGITAL_ARREST'
  | 'JOB_SCAM'
  | 'MULE_RECRUITMENT'
  | 'IMPERSONATION'
  | 'OTHER';

export type DeliveryMedium =
  | 'CALL'
  | 'SMS'
  | 'WHATSAPP'
  | 'TELEGRAM'
  | 'EMAIL'
  | 'WEBSITE'
  | 'SOCIAL_MEDIA'
  | 'APP'
  | 'OTHER';

export type IdentifierType =
  | 'PHONE'
  | 'UPI'
  | 'BANK_ACCOUNT'
  | 'UTR'
  | 'URL'
  | 'DOMAIN'
  | 'APP_NAME'
  | 'EMAIL'
  | 'HANDLE'
  | 'OTHER';

export interface FraudIdentifier {
  readonly type: IdentifierType;
  readonly value: string;
}

export interface OfficialChannel {
  readonly id: OfficialChannelId;
  readonly name: string;
  readonly shortName: string;
  readonly governingAgency: string;
  readonly officialUrl?: string;
  readonly officialContactGuidance?: string;
  readonly helplineNumber?: string;
  readonly operatingHours: string;
  readonly category: ChannelCategory;
  readonly scope: string;
  readonly acceptedIdentifiers: readonly IdentifierType[];
  readonly proceduralLimitations: readonly string[];
  readonly prerequisites?: readonly string[];
  readonly regulatorySource: string;
}

export interface FraudIncidentContext {
  readonly incidentType: IncidentCategory;
  readonly hasFinancialLoss: boolean;
  readonly financialLossAmount?: number;
  readonly elapsedHoursSinceLoss?: number;
  readonly deliveryChannel?: DeliveryMedium;
  readonly isRegisteredEntity?: boolean;
  readonly hasExtortionOrThreats?: boolean;
  readonly hasPaymentCredentialsShared?: boolean;
  readonly identifiers?: readonly FraudIdentifier[];
  readonly description?: string;
}

export interface ChannelRoutingResult {
  readonly primaryChannel: OfficialChannel;
  readonly rationale: string;
  readonly urgencyLevel: 'EMERGENCY' | 'HIGH' | 'STANDARD';
  readonly immediateActionSteps: readonly string[];
  readonly secondaryChannels: readonly OfficialChannel[];
  readonly importantCaveats: readonly string[];
  readonly isUncertain?: boolean;
  readonly uncertaintyReason?: string;
}

/**
 * Authoritative registry of official Indian cyber fraud and financial reporting channels.
 * Strictly source-backed by verified government and regulatory sources as of October 2026.
 */
export const OFFICIAL_CHANNELS: Readonly<Record<OfficialChannelId, OfficialChannel>> = {
  CYBERCRIME_1930: {
    id: 'CYBERCRIME_1930',
    name: 'National Cyber Crime Reporting Portal & 1930 Helpline',
    shortName: '1930 / Cybercrime Portal',
    governingAgency: 'Indian Cybercrime Coordination Centre (I4C), Ministry of Home Affairs (MHA)',
    officialUrl: 'https://cybercrime.gov.in/',
    helplineNumber: '1930',
    operatingHours: '24x7 (Helpline & Portal)',
    category: 'CRIME_INVESTIGATION',
    scope:
      'Primary statutory channel for cyber financial fraud, unauthorized online debits, digital arrest impersonation, blackmail, extortion, and cyber harassment.',
    acceptedIdentifiers: ['PHONE', 'UPI', 'BANK_ACCOUNT', 'UTR', 'URL', 'DOMAIN', 'APP_NAME', 'EMAIL', 'HANDLE'],
    proceduralLimitations: [
      'Calling 1930 triggers inter-bank alerts via CFCFRMS to attempt debit holds; it does not guarantee fund reversal or recovery.',
      'Victims must complete formal complaint registration on cybercrime.gov.in using the 1930 SMS ticket reference ID; submitting a portal complaint is an intake step and is not automatically equivalent to FIR registration.',
      'Fund recovery depends on recipient account balances and judicial / police disposal orders.',
    ],
    prerequisites: ['Transaction UTR numbers, suspect identifiers, and payment receipts where applicable.'],
    regulatorySource: 'Ministry of Home Affairs / I4C CFCFRMS Operational Guidelines',
  },

  CHAKSHU_DOT: {
    id: 'CHAKSHU_DOT',
    name: 'Chakshu — Sanchar Saathi',
    shortName: 'Chakshu (DoT)',
    governingAgency: 'Department of Telecommunications (DoT), Ministry of Communications',
    officialUrl: 'https://sancharsaathi.gov.in/',
    operatingHours: '24x7 (Online Portal)',
    category: 'TELECOM_INTELLIGENCE',
    scope:
      'Intelligence reporting for suspected fraudulent communications received via SMS, voice calls, or WhatsApp (e.g. fake KYC alerts, lottery claims, disconnection threats).',
    acceptedIdentifiers: ['PHONE', 'URL', 'DOMAIN'],
    proceduralLimitations: [
      'Chakshu is strictly a telecom prevention and intelligence platform for re-verification and disconnection of rogue telecom resources.',
      'Does not register legal FIRs, freeze bank accounts, or recover funds.',
      'Any incident involving transferred funds must be reported to 1930 and the victim bank fraud desk.',
    ],
    prerequisites: ['Suspect caller number, message header, communication timestamp, and message screenshot.'],
    regulatorySource: 'Department of Telecommunications Sanchar Saathi Framework',
  },

  RBI_SACHET: {
    id: 'RBI_SACHET',
    name: 'RBI Sachet Portal',
    shortName: 'RBI Sachet',
    governingAgency: 'Reserve Bank of India (RBI) under SLCC Multi-Regulator Framework',
    officialUrl: 'https://sachet.rbi.org.in/',
    operatingHours: '24x7 (Online Portal)',
    category: 'REGULATORY_INTELLIGENCE',
    scope:
      'Information sharing and intelligence gathering on unauthorized deposit-taking, Ponzi schemes, unregistered Digital Lending Apps (DLAs), and illegal collective investment entities.',
    acceptedIdentifiers: ['APP_NAME', 'DOMAIN', 'URL', 'BANK_ACCOUNT', 'PHONE'],
    proceduralLimitations: [
      'Regulatory intelligence and multi-agency coordination mechanism; not a forum for individual claim settlement or compensation.',
      'Reports are routed to relevant financial regulators (RBI, SEBI, IRDAI, NHB) and State Police Economic Offences Wings (EOW).',
      'If active extortion, blackmail, or fund loss occurred, victim must report via 1930 / cybercrime portal.',
    ],
    prerequisites: ['Entity name, application name, promotional link, or payment details.'],
    regulatorySource: 'State Level Coordination Committee (SLCC) / RBI Sachet Mechanism',
  },

  SEBI_SCORES: {
    id: 'SEBI_SCORES',
    name: 'SEBI Complaints Redress System (SCORES 2.0)',
    shortName: 'SEBI SCORES 2.0',
    governingAgency: 'Securities and Exchange Board of India (SEBI)',
    officialUrl: 'https://scores.sebi.gov.in/',
    helplineNumber: '1800 266 7575 / 1800 22 7575',
    operatingHours: '24x7 (Portal); Helpline: Working days 9:00 AM – 6:00 PM IST',
    category: 'GRIEVANCE_REDRESSAL',
    scope:
      'Formal investor grievance redressal against SEBI-registered entities (listed companies, registered stock brokers, depositories, registered mutual funds).',
    acceptedIdentifiers: ['DOMAIN', 'URL', 'OTHER'],
    proceduralLimitations: [
      'Handles grievances strictly against SEBI-registered intermediaries; cannot entertain complaints against unregistered fraudulent syndicates.',
      'Complainant must first lodge a formal complaint with the regulated intermediary before escalating to SCORES 2.0.',
      'Does not adjudicate commercial disputes beyond SEBI investor protection regulations.',
    ],
    prerequisites: ['Prior complaint reference with registered entity, PAN, DP ID / Client ID.'],
    regulatorySource: 'SEBI Master Circular on Redressal of Investor Grievances (SCORES 2.0)',
  },

  SEBI_MI_PORTAL: {
    id: 'SEBI_MI_PORTAL',
    name: 'SEBI Market Intelligence Portal',
    shortName: 'SEBI MI Portal',
    governingAgency: 'Securities and Exchange Board of India (SEBI)',
    officialUrl: 'https://miportal.sebi.gov.in/',
    operatingHours: '24x7 (Online Portal)',
    category: 'REGULATORY_INTELLIGENCE',
    scope:
      'Confidential tips regarding suspected unregistered investment advisors, fraudulent trading apps, Telegram stock recommendation syndicates, and fake IPO schemes.',
    acceptedIdentifiers: ['APP_NAME', 'DOMAIN', 'URL', 'PHONE', 'HANDLE', 'UPI', 'BANK_ACCOUNT'],
    proceduralLimitations: [
      'Confidential regulatory intelligence platform for SEBI surveillance and enforcement.',
      'Does not provide case status updates, claim compensation, or refund stolen investments.',
      'For monetary losses, report immediately to 1930 / cybercrime portal and the bank fraud desk.',
    ],
    prerequisites: ['Scheme details, social media channel links, fake app screenshots, or suspect details.'],
    regulatorySource: 'SEBI Market Intelligence Surveillance Framework',
  },

  BANK_FRAUD_DESK: {
    id: 'BANK_FRAUD_DESK',
    name: "Victim's Bank 24x7 Fraud Desk & Immediate Debit-Hold Channel",
    shortName: 'Bank 24x7 Fraud Desk',
    governingAgency: "Victim's Account-Holding Regulated Entity (Bank / Card Issuer)",
    officialContactGuidance:
      "Use the verified 24x7 fraud reporting telephone number printed on the back of your physical debit/credit card, monthly account statement, or inside your bank's verified mobile application. Never call numbers found via search engine ads or unverified web searches.",
    operatingHours: '24x7 (Bank Fraud Helplines)',
    category: 'CRIME_INVESTIGATION',
    scope:
      'Immediate reporting of unauthorized debits, blocking compromised cards/netbanking access, and logging urgent debit-hold requests citing transaction UTR numbers.',
    acceptedIdentifiers: ['UTR', 'BANK_ACCOUNT', 'UPI', 'PHONE'],
    proceduralLimitations: [
      'Immediate notification alerts the bank to block further transactions and log a debit-hold request; fund preservation depends on whether money has already exited the destination accounts.',
      'Under RBI Circular RBI/2017-18/15, if customer voluntarily shared payment credentials (OTP, PIN, passwords), customer bears the entire loss until reported to the bank.',
      'Never trust customer care numbers found via online search ads or unsolicited phone calls claiming to represent bank security teams.',
    ],
    prerequisites: ['Transaction UTR numbers, account number, transaction timestamps, and masked card details.'],
    regulatorySource: 'RBI Customer Protection Framework (RBI/2017-18/15) & Bank 24x7 Fraud Operations Guidelines',
  },

  BANK_INTERNAL_GRIEVANCE: {
    id: 'BANK_INTERNAL_GRIEVANCE',
    name: 'Bank Internal Grievance Redressal Mechanism & Principal Nodal Officer',
    shortName: 'Bank Internal Grievance Desk',
    governingAgency: 'Regulated Financial Entity (Bank / NBFC Internal Grievance Machinery)',
    officialContactGuidance:
      "Submit a formal written dispute through your bank's verified branch, netbanking dispute portal, or escalate to the Principal Nodal Officer (PNO) listed on your bank's official website.",
    operatingHours: 'Standard Banking & Online Grievance Hours',
    category: 'GRIEVANCE_REDRESSAL',
    scope:
      'Formal lodging of disputed transactions, contesting liability determinations, and multi-tier internal grievance redressal (Branch Manager -> Grievance Redressal Officer -> Principal Nodal Officer).',
    acceptedIdentifiers: ['UTR', 'BANK_ACCOUNT', 'UPI'],
    proceduralLimitations: [
      'Mandatory prerequisite before escalating to the RBI Ombudsman: the complainant must first lodge a formal dispute with the regulated entity and allow the applicable response period.',
      'Applicable response period may be the timeline specified under RBI, NPCI, or card-network guidelines, or 30 days, whichever is longer.',
      'Ensure a formal dispute reference number or written acknowledgment is obtained and preserved.',
    ],
    prerequisites: ['Prior fraud desk reference, transaction UTR, disputed transaction particulars, and written complaint.'],
    regulatorySource: 'RBI Internal Grievance Redressal Mechanism & Customer Service Guidelines',
  },

  RBI_OMBUDSMAN: {
    id: 'RBI_OMBUDSMAN',
    name: 'Reserve Bank - Integrated Ombudsman Scheme, 2026 (RB-IOS 2026)',
    shortName: 'RBI Ombudsman (RB-IOS 2026)',
    governingAgency: 'Reserve Bank of India (RBI)',
    officialUrl: 'https://cms.rbi.org.in/',
    officialContactGuidance:
      'Lodge online complaints through the official RBI Complaint Management System (CMS) at https://cms.rbi.org.in/.',
    operatingHours: '24x7 (Online Portal cms.rbi.org.in)',
    category: 'GRIEVANCE_REDRESSAL',
    scope:
      'Statutory ombudsman escalation for unresolved complaints against RBI-regulated entities (Commercial Banks, Cooperative Banks, Payment Banks, NBFCs) under the Integrated Ombudsman Scheme, 2026.',
    acceptedIdentifiers: ['UTR', 'BANK_ACCOUNT', 'UPI', 'PHONE'],
    proceduralLimitations: [
      'Opening the RBI CMS is NOT a substitute for immediately notifying your bank fraud team or calling 1930.',
      'Prior Bank Complaint Prerequisite: The customer must first file a formal written complaint with the regulated entity.',
      'Escalation Eligibility: Permitted only if the customer is dissatisfied with the bank reply or resolution (including whole or partial rejection), OR the bank fails to reply within the applicable response period (guidelines timeline or 30 days, whichever is longer). Rejection is not a separate unconditional route.',
      '90-Day Limitation Period: Under RB-IOS 2026, complaints must be filed within 90 days from the date the applicable response window expires OR the date of the bank last reply, whichever is later, subject to RB-IOS 2026 eligibility conditions.',
      'Complaints received prior to July 1, 2026 remain governed by the provisions of the 2021 scheme.',
      'Underlying claim must fall within the applicable limitation period under the Limitation Act, 1963.',
    ],
    prerequisites: ['Bank complaint reference ID, bank reply copy (if received), transaction UTR, and date of initial bank complaint.'],
    regulatorySource: 'Reserve Bank - Integrated Ombudsman Scheme, 2026 (Effective July 1, 2026)',
  },
};

/**
 * Standard legal and procedural caveats appended to all official recommendations.
 */
const UNIVERSAL_CAVEATS: readonly string[] = [
  'Scamfy does not file official complaints on your behalf; submissions must be made directly through the verified government or bank channels.',
  'Calling 1930 initiates inter-bank CFCFRMS alerts to attempt transaction holds; however, CFCFRMS cannot guarantee a freeze or fund recovery, which depends on recipient account balances and police/court disposal orders.',
  'For bank-specific reporting, use only the verified contact numbers on your physical card, bank statement, or official banking app. Never call numbers found in search-engine advertisements.',
  'Escalating to the RBI Ombudsman on cms.rbi.org.in is an escalation mechanism after filing with your bank; opening the RBI CMS is NOT a substitute for immediately alerting your bank fraud team or calling 1930.',
  'Never pay any private third-party claiming to offer "fund recovery services"; legitimate recovery occurs only through official banking and law enforcement procedures.',
];

/**
 * Full sequence of immediate next actions required for financial loss or unauthorized transfers.
 * Uniformly provided across all elapsed times (30 min, 4 hr, 24 hr, 7 days).
 */
const FINANCIAL_LOSS_ACTION_STEPS: readonly string[] = [
  'Call the National Cyber Crime Helpline immediately at 1930 to initiate CFCFRMS inter-bank alerts across recipient accounts.',
  'Contact your own bank 24x7 fraud desk immediately (using verified contact details on your physical card or official banking app) to block compromised payment instruments and request urgent debit holds citing transaction UTR numbers.',
  'Log in to cybercrime.gov.in using the 1930 SMS ticket reference ID to formalize the complaint and upload transaction receipts and evidence.',
  'Submit a formal written transaction dispute to your bank internal grievance desk citing the transaction UTR and 1930 complaint acknowledgment.',
];

/**
 * Pure, deterministic routing engine resolving official fraud reporting channels
 * based on incident indicators, loss presence, and procedural jurisdictions.
 *
 * Guaranteed: No external network calls, completely deterministic, auditable.
 */
export function resolveReportingChannel(incident: FraudIncidentContext): ChannelRoutingResult {
  // Validate input presence
  if (!incident || !incident.incidentType) {
    return {
      primaryChannel: OFFICIAL_CHANNELS.CYBERCRIME_1930,
      rationale:
        'Insufficient incident details provided. For safety, the National Cyber Crime 1930 helpline is recommended as the primary national contact.',
      urgencyLevel: 'STANDARD',
      immediateActionSteps: [
        'Check your bank account statements immediately for any unauthorized debits or unexpected OTPs.',
        'If any unauthorized debit has occurred, call 1930 and notify your bank fraud desk immediately.',
        'Collect relevant transaction IDs, caller numbers, and message screenshots.',
      ],
      secondaryChannels: [OFFICIAL_CHANNELS.BANK_FRAUD_DESK],
      importantCaveats: [...UNIVERSAL_CAVEATS],
      isUncertain: true,
      uncertaintyReason: 'Incident type is missing or malformed.',
    };
  }

  const hasLoss = incident.hasFinancialLoss || (incident.financialLossAmount !== undefined && incident.financialLossAmount > 0);
  const elapsedHours = incident.elapsedHoursSinceLoss ?? 0;
  const isRecent = elapsedHours <= 4;

  // RULE 1: Financial Loss or Unauthorized Transfer ALWAYS takes absolute precedence
  if (hasLoss || incident.incidentType === 'UNAUTHORIZED_TRANSFER') {
    const caveats = [...UNIVERSAL_CAVEATS];

    if (incident.hasPaymentCredentialsShared) {
      caveats.push(
        'Important: If payment credentials (OTP, PIN, passwords) were shared, RBI Circular RBI/2017-18/15 stipulates customer liability until reported to the bank. Notify your bank fraud desk immediately to halt any further transactions.'
      );
    }

    let rationale =
      'Because financial loss or unauthorized transfer occurred, calling 1930 and contacting your bank 24x7 fraud desk is the mandatory primary route regardless of elapsed time. CFCFRMS can facilitate inter-bank alerts and attempted debit holds, though it cannot guarantee a freeze or recovery.';

    if (isRecent) {
      rationale +=
        ' As the transaction occurred recently (within 4 hours), immediate reporting maximizes the opportunity for banks to act before funds are withdrawn, but victims should seek immediate transaction intervention regardless of elapsed time.';
    } else {
      rationale +=
        ' Even when time has elapsed, immediate reporting remains critical to alert beneficiary banks, preserve official evidence on cybercrime.gov.in, and establish formal dispute records with your bank.';
    }

    const secondary: OfficialChannel[] = [
      OFFICIAL_CHANNELS.BANK_FRAUD_DESK,
      OFFICIAL_CHANNELS.BANK_INTERNAL_GRIEVANCE,
      OFFICIAL_CHANNELS.RBI_OMBUDSMAN,
    ];

    // Contextual secondary additions
    if (
      incident.deliveryChannel === 'CALL' ||
      incident.deliveryChannel === 'SMS' ||
      incident.deliveryChannel === 'WHATSAPP' ||
      incident.incidentType === 'TELECOM_PHISHING'
    ) {
      secondary.push(OFFICIAL_CHANNELS.CHAKSHU_DOT);
    }

    if (incident.incidentType === 'INVESTMENT_SCAM') {
      secondary.push(
        incident.isRegisteredEntity ? OFFICIAL_CHANNELS.SEBI_SCORES : OFFICIAL_CHANNELS.SEBI_MI_PORTAL
      );
    } else if (incident.incidentType === 'LOAN_HARASSMENT' || incident.incidentType === 'DEPOSIT_SCHEME') {
      secondary.push(OFFICIAL_CHANNELS.RBI_SACHET);
    }

    return {
      primaryChannel: OFFICIAL_CHANNELS.CYBERCRIME_1930,
      rationale,
      urgencyLevel: isRecent ? 'EMERGENCY' : 'HIGH',
      immediateActionSteps: FINANCIAL_LOSS_ACTION_STEPS,
      secondaryChannels: secondary,
      importantCaveats: caveats,
    };
  }

  // RULE 2: Digital Arrest / Impersonation / Extortion / Severe Cybercrime without financial loss
  if (
    incident.incidentType === 'DIGITAL_ARREST' ||
    incident.hasExtortionOrThreats ||
    incident.incidentType === 'IMPERSONATION'
  ) {
    return {
      primaryChannel: OFFICIAL_CHANNELS.CYBERCRIME_1930,
      rationale:
        'Impersonation of police, customs, CBI, or judges ("digital arrest") and criminal extortion are serious cyber offences under the Bharatiya Nyaya Sanhita (BNS) and IT Act. Immediate reporting to the Cyber Crime Portal is required.',
      urgencyLevel: 'HIGH',
      immediateActionSteps: [
        'Do not transfer any money, security deposits, or verification fees. Indian law enforcement agencies NEVER place individuals under video "digital arrest".',
        'Disconnect calls and block the suspect numbers immediately.',
        'File an official cybercrime report on cybercrime.gov.in or dial 1930 with call recordings, screenshots, and suspect phone numbers.',
      ],
      secondaryChannels: [
        OFFICIAL_CHANNELS.CHAKSHU_DOT,
        OFFICIAL_CHANNELS.BANK_FRAUD_DESK,
      ],
      importantCaveats: [...UNIVERSAL_CAVEATS],
    };
  }

  // RULE 3: Telecom Phishing / Suspicious Calls / SMS / WhatsApp without financial loss
  if (
    incident.incidentType === 'TELECOM_PHISHING' ||
    (incident.deliveryChannel === 'CALL' ||
      incident.deliveryChannel === 'SMS' ||
      incident.deliveryChannel === 'WHATSAPP')
  ) {
    if (
      incident.incidentType !== 'INVESTMENT_SCAM' &&
      incident.incidentType !== 'LOAN_HARASSMENT' &&
      incident.incidentType !== 'DEPOSIT_SCHEME'
    ) {
      return {
        primaryChannel: OFFICIAL_CHANNELS.CHAKSHU_DOT,
        rationale:
          'Because no money was transferred and communication occurred via phone call, SMS, or WhatsApp, reporting to DoT Chakshu allows telecom authorities to re-verify, blacklist, and disconnect fraudulent numbers.',
        urgencyLevel: 'STANDARD',
        immediateActionSteps: [
          'Capture screenshots of the fraudulent SMS or WhatsApp message, including sender ID or phone number.',
          'Submit the communication details on sancharsaathi.gov.in under the Chakshu facility.',
          'Block the sender on your phone and messaging apps.',
        ],
        secondaryChannels: [OFFICIAL_CHANNELS.CYBERCRIME_1930],
        importantCaveats: [
          ...UNIVERSAL_CAVEATS,
          'Chakshu is strictly for telecom resource blocking; it does not process financial claims or FIRs.',
        ],
      };
    }
  }

  // RULE 4: Securities & Investment Schemes without financial loss
  if (incident.incidentType === 'INVESTMENT_SCAM') {
    if (incident.isRegisteredEntity) {
      return {
        primaryChannel: OFFICIAL_CHANNELS.SEBI_SCORES,
        rationale:
          'For grievances involving SEBI-registered intermediaries, mutual funds, or listed companies, SCORES 2.0 is the official investor grievance redressal portal.',
        urgencyLevel: 'STANDARD',
        immediateActionSteps: [
          'Verify that you have first lodged a formal complaint directly with the registered entity.',
          'If unresolved or rejected, register your complaint on scores.sebi.gov.in citing prior grievance details.',
        ],
        secondaryChannels: [OFFICIAL_CHANNELS.CYBERCRIME_1930],
        importantCaveats: [
          ...UNIVERSAL_CAVEATS,
          'SCORES 2.0 entertains complaints only against registered entities. It cannot handle unregistered Telegram/WhatsApp trading syndicates.',
        ],
      };
    }

    // Unregistered syndicate / tip group / fake trading app
    return {
      primaryChannel: OFFICIAL_CHANNELS.SEBI_MI_PORTAL,
      rationale:
        'Suspected unregistered stock advisors, fraudulent trading apps, and Telegram pump-and-dump syndicates should be reported to the SEBI Market Intelligence Portal for regulatory surveillance.',
      urgencyLevel: 'STANDARD',
      immediateActionSteps: [
        'Save screenshots of social media groups, promotional links, and promised return statements.',
        'Submit a confidential tip on miportal.sebi.gov.in under Market Intelligence.',
        'Do not deposit any funds or share bank credentials with the syndicate.',
      ],
      secondaryChannels: [
        OFFICIAL_CHANNELS.CYBERCRIME_1930,
        OFFICIAL_CHANNELS.CHAKSHU_DOT,
      ],
      importantCaveats: [
        ...UNIVERSAL_CAVEATS,
        'SEBI Market Intelligence Portal collects regulatory surveillance intelligence; it does not provide individual dispute resolution or refunds.',
      ],
    };
  }

  // RULE 5: Loan Harassment & Deposit Traps without financial loss or physical threats
  if (incident.incidentType === 'LOAN_HARASSMENT' || incident.incidentType === 'DEPOSIT_SCHEME') {
    return {
      primaryChannel: OFFICIAL_CHANNELS.RBI_SACHET,
      rationale:
        'Suspected illegal lending apps, unauthorized deposit-taking schemes, or Ponzi solicitations should be reported to the RBI Sachet Portal to coordinate multi-regulatory action across RBI, SEBI, and state police EOW.',
      urgencyLevel: 'STANDARD',
      immediateActionSteps: [
        'Collect app details, APK download links, promotional messages, and promised yield terms.',
        'Lodge a report on sachet.rbi.org.in under unauthorized financial schemes.',
        'If the app accesses phone contacts or engages in harassment, revoke app permissions and report to cybercrime.gov.in.',
      ],
      secondaryChannels: [
        OFFICIAL_CHANNELS.CYBERCRIME_1930,
        OFFICIAL_CHANNELS.CHAKSHU_DOT,
      ],
      importantCaveats: [
        ...UNIVERSAL_CAVEATS,
        'RBI Sachet is a multi-regulator intelligence portal; if you experience active blackmail or money extortion, report immediately to 1930 / local police.',
      ],
    };
  }

  // RULE 6: Job Scam / Mule Recruitment without financial loss
  if (incident.incidentType === 'JOB_SCAM' || incident.incidentType === 'MULE_RECRUITMENT') {
    const cameViaTelecom =
      incident.deliveryChannel === 'CALL' ||
      incident.deliveryChannel === 'SMS' ||
      incident.deliveryChannel === 'WHATSAPP';

    if (cameViaTelecom) {
      return {
        primaryChannel: OFFICIAL_CHANNELS.CHAKSHU_DOT,
        rationale:
          'Fraudulent job offers, daily-task solicitations, or money mule recruitment received via WhatsApp/SMS should be reported to Chakshu for telecom blocking.',
        urgencyLevel: 'STANDARD',
        immediateActionSteps: [
          'Never agree to receive funds in your bank account or forward money to third parties (money mule recruitment is a criminal offence).',
          'Report the sender number and message on sancharsaathi.gov.in (Chakshu).',
          'Block the sender immediately.',
        ],
        secondaryChannels: [OFFICIAL_CHANNELS.CYBERCRIME_1930],
        importantCaveats: [...UNIVERSAL_CAVEATS],
      };
    }

    return {
      primaryChannel: OFFICIAL_CHANNELS.CYBERCRIME_1930,
      rationale:
        'Fake employment offers, review tasks, and money mule recruitment schemes operate as criminal syndicates and should be reported to the Cyber Crime Portal.',
      urgencyLevel: 'STANDARD',
      immediateActionSteps: [
        'Never forward money or rent your bank account / UPI ID.',
        'Submit suspected websites and recruiter handles to cybercrime.gov.in.',
      ],
      secondaryChannels: [OFFICIAL_CHANNELS.CHAKSHU_DOT],
      importantCaveats: [...UNIVERSAL_CAVEATS],
    };
  }

  // Ambiguous / Other cases
  return {
    primaryChannel: OFFICIAL_CHANNELS.CYBERCRIME_1930,
    rationale:
      'Based on the provided details, the National Cyber Crime Portal & 1930 Helpline provides the broadest statutory jurisdiction for investigating cyber fraud.',
    urgencyLevel: 'STANDARD',
    immediateActionSteps: [
      'Preserve all communications, messages, URLs, and transaction records.',
      'If monetary loss occurs at any point, contact 1930 and your bank fraud desk immediately.',
    ],
    secondaryChannels: [OFFICIAL_CHANNELS.BANK_FRAUD_DESK],
    importantCaveats: [...UNIVERSAL_CAVEATS],
    isUncertain: true,
    uncertaintyReason:
      'The incident category did not match a specific regulatory routing rule; general cybercrime guidance applied.',
  };
}
