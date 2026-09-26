import re
from typing import Any

from backend.app.api.v1.schemas.analyze import (
    AnalysisSignal,
    AnalyzeResponse,
    ConfidenceTier,
    ExtractedEntities,
    RiskLevel,
)

# Deterministic Scam Rule Definitions (10 High-Prevalence Indian Threat Categories)
RULES = [
    {
        "id": "RULE-UPI-PIN-REVERSE",
        "category": "UPI_REVERSE_PAYMENT_FRAUD",
        "severity": RiskLevel.CRITICAL,
        "name": "UPI PIN Receive Trick",
        "description": "The message implies that entering a UPI PIN, scanning a QR code, or accepting a collect request will credit funds to your account.",
        "patterns": [
            r"(?:enter|put|submit|provide|use)\s*(?:your\s*)?(?:upi\s*)?pin\s*(?:to\s*)?(?:receive|get|credit|claim|accept)",
            r"(?:scan|open)\s*(?:the\s*)?qr\s*(?:code\s*)?(?:to\s*)?(?:receive|accept|get|claim)\s*(?:money|cash|payment|amount)",
            r"(?:approve|accept)\s*(?:the\s*)?(?:request|collect)\s*(?:to\s*)?(?:receive|get|claim)\s*(?:refund|money|reward)",
            r"(?:receive|get|claim)\s*(?:rs\.?|₹|inr)?\s*[\d,]+\s*(?:refund|cashback|prize)\s*(?:by|via|with|entering)\s*pin",
        ],
        "tactics": ["Greed / Reward Trap", "Reversal Deception"],
        "recommendations": [
            "CRITICAL: UPI PIN is required ONLY to SEND money, NEVER to receive money.",
            "Never scan any QR code or approve a collect request to claim a payment or refund.",
            "Decline this payment request immediately inside your UPI application.",
        ],
    },
    {
        "id": "RULE-DIGITAL-ARREST-EXTORTION",
        "category": "IMPERSONATION_POLICE_EXTORTION",
        "severity": RiskLevel.CRITICAL,
        "name": "Digital Arrest / Law Enforcement Impersonation",
        "description": "Scammers impersonate police, CBI, ED, or customs officials claiming an illegal parcel or money laundering case to demand immediate video call interrogation or fund transfer.",
        "patterns": [
            r"digital\s*arrest",
            r"(?:cbi|police|customs|narcotics|crime\s*branch)\s*officer",
            r"(?:arrest\s*warrant|case\s*registered)\s*(?:against\s*you|under\s*your\s*name)",
            r"(?:illegal\s*parcel|drugs\s*found|money\s*laundering)\s*(?:at\s*customs|in\s*package)",
            r"join\s*(?:skype|video|whatsapp)\s*call\s*(?:for\s*)?(?:interrogation|investigation|statement)",
        ],
        "tactics": ["False Authority Impersonation", "Legal Coercion & Intimidation"],
        "recommendations": [
            "Indian police and law enforcement do NOT conduct 'digital arrests' or video-call interrogations.",
            "Do NOT transfer any money to 'safeguard funds' or 'verify innocence'.",
            "Dial 1930 (National Cyber Crime Helpline) or report immediately at cybercrime.gov.in.",
        ],
    },
    {
        "id": "RULE-CUSTOMS-PARCEL-EXTORTION",
        "category": "IMPERSONATION_POLICE_EXTORTION",
        "severity": RiskLevel.CRITICAL,
        "name": "FedEx / Customs Narcotics Parcel Extortion",
        "description": "Scammers claim an overseas parcel sent in your name containing narcotics/passports was intercepted by customs or police.",
        "patterns": [
            r"(?:fedex|dhl|bluedart|speed\s*post|courier)\s*(?:parcel|package|consignment)\s*(?:held|detained|intercepted)",
            r"(?:drugs|mdma|contraband|fake\s*passports)\s*(?:found\s*in|inside)\s*(?:your\s*)?(?:parcel|courier|box)",
            r"(?:customs|mumbai\s*police|delhi\s*police)\s*(?:clearance|noc\s*certificate|fine\s*payment)",
        ],
        "tactics": ["Fabricated Legal Threat", "High-Urgency Extortion"],
        "recommendations": [
            "Legitimate courier companies never connect you directly to police video calls or ask for funds.",
            "Never transfer money for 'customs clearance' or 'case closure fees'.",
            "Contact official courier support directly using verified website numbers.",
        ],
    },
    {
        "id": "RULE-LOAN-APK-HARASSMENT",
        "category": "PREDATORY_LOAN_FRAUD",
        "severity": RiskLevel.CRITICAL,
        "name": "Predatory Loan APK & Contact Harassment Lure",
        "description": "Offers instant no-KYC loans requiring APK installation or granting gallery/contact permissions, leading to extortion.",
        "patterns": [
            r"(?:instant|7\s*day|urgent)\s*loan.*?(?:without\s*cibil|no\s*documents|download\s*apk)",
            r"(?:loan\s*approved|disbursed)\s*(?:rs\.?|₹|inr)?\s*[\d,]+.*?(?:install|apk\s*link)",
            r"(?:contacts|gallery|photos)\s*(?:permission|access).*?(?:loan|repayment)",
        ],
        "tactics": ["Predatory Financial Bait", "Blackmail Permission Traps"],
        "recommendations": [
            "Never download or install loan APK files from outside the official Google Play Store / Apple App Store.",
            "Never grant contacts or photos permissions to unverified loan applications.",
            "Verify the lender on the official RBI registered NBFC list before applying.",
        ],
    },
    {
        "id": "RULE-ELECTRICITY-DISCONNECTION",
        "category": "UTILITY_ELECTRICITY_FRAUD",
        "severity": RiskLevel.CRITICAL,
        "name": "Urgent Electricity Disconnection Threat",
        "description": "Urgent SMS claiming your power supply will be disconnected tonight due to unpaid bills, directing you to call a personal mobile number.",
        "patterns": [
            r"(?:electricity|power)\s*(?:bill\s*)?(?:will\s*be\s*)?disconnected\s*(?:tonight|by\s*\d|today|at\s*\d)",
            r"(?:dear\s*consumer|consumer\s*number).*?(?:disconnected|power\s*cut)",
            r"(?:call|contact)\s*(?:our\s*)?(?:electricity\s*)?officer\s*(?:at|on|number)",
            r"update\s*(?:your\s*)?electricity\s*(?:bill|account)",
        ],
        "tactics": ["Artificial Urgency", "Fear of Utility Loss"],
        "recommendations": [
            "State electricity boards never send disconnection notices via personal mobile numbers.",
            "Do not call the mobile number listed in the SMS or install any remote desktop APK file.",
            "Verify your bill status directly on your official state DISCOM portal or electricity app.",
        ],
    },
    {
        "id": "RULE-PART-TIME-TASK-COMMISSION",
        "category": "TASK_COMMISSION_FRAUD",
        "severity": RiskLevel.HIGH_RISK,
        "name": "Part-Time Task & Telegram Commission Scam",
        "description": "Offers high daily income for trivial tasks like liking YouTube videos, reviewing hotels, or typing, eventually demanding prepaid recharge deposits.",
        "patterns": [
            r"(?:part\s*time|work\s*from\s*home)\s*job.*?(?:daily|earn|income)",
            r"(?:like|subscribe)\s*(?:youtube\s*)?videos.*?(?:earn|per\s*day|rupees)",
            r"earn\s*(?:rs\.?|₹|inr)?\s*[\d,]+(?:\s*-\s*[\d,]+)?\s*(?:daily|per\s*day|hourly)",
            r"(?:telegram|whatsapp)\s*(?:group|contact)\s*(?:for\s*)?(?:tasks|salary|payment)",
            r"(?:prepaid\s*task|vip\s*task|deposit\s*fee|task\s*commission)",
        ],
        "tactics": ["Easy Money Lure", "Sunk-Cost Prepaid Trap"],
        "recommendations": [
            "Legitimate companies never pay daily wages on Telegram for liking social media content.",
            "Never transfer money for 'prepaid tasks' or 'security deposits' to unlock profits.",
            "Block and report the sender on WhatsApp/Telegram immediately.",
        ],
    },
    {
        "id": "RULE-BANK-KYC-PAN-PHISHING",
        "category": "LOTTERY_KYC_PHISHING",
        "severity": RiskLevel.HIGH_RISK,
        "name": "Bank Account KYC / PAN Blocking Lure",
        "description": "Urgent SMS claiming your bank account or debit card is blocked/suspended, with a phishing link to update KYC or PAN details.",
        "patterns": [
            r"(?:bank\s*account|sbi|hdfc|icici|pnb|axis|yono|paytm|kotak)\s*(?:has\s*been\s*|will\s*be\s*)?(?:blocked|suspended|deactivated|closed)",
            r"(?:update|link)\s*(?:your\s*)?(?:pan|kyc|aadhaar)\s*(?:immediately|within\s*\d+\s*hours?)",
            r"(?:click\s*here|visit\s*link)\s*(?:to\s*)?(?:unblock|reactivate|update\s*kyc)",
        ],
        "tactics": ["Account Access Fear", "Credential Harvesting Phishing"],
        "recommendations": [
            "Banks never send SMS messages with shortened links or APKs to update KYC or PAN details.",
            "Do not click on links in SMS. Use only the official NetBanking portal or mobile banking app.",
            "Report phishing SMS to your bank's official fraud helpline.",
        ],
    },
    {
        "id": "RULE-CRYPTO-STOCK-VIP-TRAP",
        "category": "INVESTMENT_STOCK_FRAUD",
        "severity": RiskLevel.HIGH_RISK,
        "name": "WhatsApp VIP Stock / Crypto Guaranteed Returns",
        "description": "Promotes exclusive WhatsApp/Telegram insider stock trading groups with guaranteed multi-bagger returns or fake institutional trading apps.",
        "patterns": [
            r"(?:vip\s*stock|insider\s*tips|institutional\s*account|upper\s*circuit)",
            r"(?:guaranteed|fixed)\s*(?:return|profit|gain)\s*(?:of\s*)?(?:\d+%\s*daily|\d+%\s*monthly|[\d,]+)",
            r"(?:crypto|forex|binary\s*option)\s*(?:trading\s*bot|signal\s*group|investment\s*platform)",
        ],
        "tactics": ["Guaranteed Profit Illusion", "Artificial Exclusivity"],
        "recommendations": [
            "SEBI-registered advisors never guarantee fixed returns on stock market investments.",
            "Never deposit funds into individual bank accounts or unverified trading portals.",
            "Verify advisor registration on the official SEBI intermediary database.",
        ],
    },
    {
        "id": "RULE-FAKE-CUSTOMER-CARE",
        "category": "SUSPICIOUS_COMMUNICATION",
        "severity": RiskLevel.SUSPICIOUS,
        "name": "Spoofed Customer Care & Helpline Number",
        "description": "Directs user to call a mobile or toll-free number for refunds, ticket cancellations, or courier tracking.",
        "patterns": [
            r"(?:customer\s*care|support\s*helpline|toll\s*free)\s*(?:number|officer)?\s*(?:call|dial)?\s*[:\-\s]*([6-9]\d{9})",
            r"(?:refund|cancellation|order\s*issue)\s*(?:call\s*our\s*representative|contact\s*support)",
        ],
        "tactics": ["Helpline SEO Spoofing", "Helpfulness Masquerade"],
        "recommendations": [
            "Search for customer care numbers ONLY on the company's verified website or official app.",
            "Do not trust contact numbers found on Google search snippets, social media comments, or SMS.",
        ],
    },
    {
        "id": "RULE-SUSPICIOUS-SHORT-URL",
        "category": "SUSPICIOUS_COMMUNICATION",
        "severity": RiskLevel.SUSPICIOUS,
        "name": "Hidden Shortened Phishing Link",
        "description": "The message contains URL shorteners commonly used to obfuscate credential harvesters or malware distribution links.",
        "patterns": [
            r"https?://(?:bit\.ly|tinyurl\.com|t\.me|wa\.me|is\.gd|cutt\.ly|rb\.gy|tiny\.cc)/",
            r"https?://[a-zA-Z0-9-]+\.(?:xyz|top|live|click|icu|buzz|vip|work|gq|cf|ml)/",
        ],
        "tactics": ["Obfuscation & Hiding True Destination"],
        "recommendations": [
            "Avoid clicking shortened links from unknown numbers.",
            "Check links using a safe URL scanner before opening.",
        ],
    },
]


def detect_missing_evidence(
    text: str, entities: ExtractedEntities, matched_rules: list[dict[str, Any]]
) -> list[str]:
    """Identify missing corroborating evidence per DET-05."""
    missing: list[str] = []

    has_critical_or_high = any(
        r["severity"] in (RiskLevel.CRITICAL, RiskLevel.HIGH_RISK) for r in matched_rules
    )

    if has_critical_or_high:
        if not entities.urls and not entities.emails:
            missing.append(
                "No verifiable corporate domain, official email header, or sender identity."
            )
        if entities.urls and any(
            "bit.ly" in u or "tinyurl" in u or "is.gd" in u for u in entities.urls
        ):
            missing.append(
                "Destination domain is obscured by a URL shortener; true destination unverified."
            )
        if (
            not entities.bank_accounts
            and not entities.upi_ids
            and (entities.amounts or entities.phone_numbers)
        ):
            missing.append(
                "No verifiable merchant registration or official transaction reference number."
            )
        if any(r["id"] == "RULE-DIGITAL-ARREST-EXTORTION" for r in matched_rules):
            missing.append(
                "No formal physical court summons, official stamped FIR document, or verifiable police station jurisdiction."
            )
        if any(r["id"] == "RULE-ELECTRICITY-DISCONNECTION" for r in matched_rules):
            missing.append(
                "No consumer ID / bill account number matching official state DISCOM records."
            )

    return missing


def evaluate_message(text: str, entities: ExtractedEntities) -> AnalyzeResponse:
    matched_signals: list[AnalysisSignal] = []
    matched_rules: list[dict[str, Any]] = []
    categories: list[str] = []
    all_recommendations: list[str] = []
    all_tactics: list[str] = []
    highest_severity_rank = 0

    severity_order = {
        RiskLevel.SAFE: 0,
        RiskLevel.CAUTION: 1,
        RiskLevel.SUSPICIOUS: 2,
        RiskLevel.HIGH_RISK: 3,
        RiskLevel.CRITICAL: 4,
    }

    rank_to_severity = {v: k for k, v in severity_order.items()}

    # Evaluate rules against text
    for rule in RULES:
        for pattern in rule["patterns"]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                evidence_snippet = match.group(0).strip()
                signal = AnalysisSignal(
                    id=rule["id"],
                    name=rule["name"],
                    description=rule["description"],
                    severity=rule["severity"],
                    evidence=evidence_snippet,
                )
                matched_signals.append(signal)
                matched_rules.append(rule)
                categories.append(rule["category"])
                all_recommendations.extend(rule["recommendations"])
                all_tactics.extend(rule.get("tactics", []))

                sev_rank = severity_order[rule["severity"]]
                if sev_rank > highest_severity_rank:
                    highest_severity_rank = sev_rank
                break  # match once per rule

    # Additional heuristics: Multiple suspicious entities with urgency
    if not matched_signals and (entities.upi_ids or entities.phone_numbers or entities.urls):
        if re.search(
            r"\b(?:urgent|immediately|hurry|expire|blocked|suspend|limited\s*time)\b",
            text,
            re.IGNORECASE,
        ):
            signal = AnalysisSignal(
                id="RULE-URGENT-SOLICITATION",
                name="Unverified Urgent Solicitation",
                description="Message creates artificial urgency combined with payment or contact identifiers.",
                severity=RiskLevel.CAUTION,
                evidence=text[:80] + "...",
            )
            matched_signals.append(signal)
            categories.append("UNVERIFIED_SOLICITATION")
            all_tactics.append("Artificial Urgency")
            all_recommendations.append(
                "Do not rush into payments or sharing personal information under artificial urgency."
            )
            highest_severity_rank = max(highest_severity_rank, severity_order[RiskLevel.CAUTION])

    # Determine overall risk
    overall_risk = rank_to_severity[highest_severity_rank]
    primary_category = categories[0] if categories else "INFORMATIONAL_OR_UNKNOWN"
    secondary_categories = list(dict.fromkeys(categories[1:]))

    # Missing evidence per DET-05
    missing_evidence = detect_missing_evidence(text, entities, matched_rules)

    # Determine confidence based on evidence signals
    if highest_severity_rank >= 3 and len(matched_signals) >= 1:
        confidence = ConfidenceTier.HIGH
    elif highest_severity_rank >= 1:
        confidence = ConfidenceTier.MEDIUM
    else:
        confidence = ConfidenceTier.LOW

    # Default recommendations if clean / safe
    if not all_recommendations:
        all_recommendations = [
            "No active high-risk scam patterns detected in this message.",
            "Always verify payment requests through independent official channels.",
            "Never share passwords, banking OTPs, or UPI PINs with anyone.",
        ]

    # Deduplicate preserving order
    deduped_recommendations = list(dict.fromkeys(all_recommendations))
    deduped_tactics = list(dict.fromkeys(all_tactics))

    # Synthesis summary
    if overall_risk == RiskLevel.CRITICAL:
        synthesis_summary = (
            f"Critical threat detected: Message matches {len(matched_signals)} red-flag pattern(s) "
            f"characteristic of {primary_category.replace('_', ' ').lower()}. Immediate protective action required."
        )
    elif overall_risk == RiskLevel.HIGH_RISK:
        synthesis_summary = (
            f"High-risk pattern detected: Message exhibits social engineering characteristics of "
            f"{primary_category.replace('_', ' ').lower()}. Do not transfer funds or share credentials."
        )
    elif overall_risk in (RiskLevel.SUSPICIOUS, RiskLevel.CAUTION):
        synthesis_summary = "Caution advised: Message contains suspicious identifiers or urgency cues without verified origin."
    else:
        synthesis_summary = "No known active scam indicators were matched. Maintain general digital safety vigilance."

    metadata: dict[str, Any] = {
        "engine": "deterministic-v2",
        "ai_assisted": False,
        "rules_evaluated": len(RULES),
        "signals_detected": len(matched_signals),
        "legal_disclaimer": "Automated security triage; not a legal or regulatory determination (AI-05)",
    }

    return AnalyzeResponse(
        overall_risk=overall_risk,
        confidence=confidence,
        primary_category=primary_category,
        secondary_categories=secondary_categories,
        signals=matched_signals,
        extracted_entities=entities,
        psychological_tactics=deduped_tactics,
        missing_evidence=missing_evidence,
        synthesis_summary=synthesis_summary,
        action_recommendations=deduped_recommendations,
        model_metadata=metadata,
    )
