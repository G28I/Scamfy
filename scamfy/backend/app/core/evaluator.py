import re
from typing import Any

from backend.app.api.v1.schemas.analyze import (
    AnalysisSignal,
    AnalyzeResponse,
    ConfidenceTier,
    ExtractedEntities,
    RiskLevel,
)

# Deterministic Scam Rule Definitions
RULES = [
    {
        "id": "RULE-UPI-PIN-REVERSE",
        "category": "UPI_REVERSE_PAYMENT_FRAUD",
        "severity": RiskLevel.CRITICAL,
        "name": "UPI PIN Receive Trick",
        "description": "The message implies that entering a UPI PIN, scanning a QR code, or accepting a request will credit funds to your account.",
        "patterns": [
            r"(?:enter|put)\s*(?:your\s*)?(?:upi\s*)?pin\s*(?:to\s*)?(?:receive|get|credit)",
            r"(?:scan|open)\s*(?:the\s*)?qr\s*(?:code\s*)?(?:to\s*)?(?:receive|accept|get)\s*(?:money|cash|payment|amount)",
            r"(?:approve|accept)\s*(?:the\s*)?(?:request|collect)\s*(?:to\s*)?(?:receive|get)\s*(?:refund|money|reward)",
            r"(?:receive|get)\s*(?:rs\.?|₹|inr)?\s*[\d,]+\s*(?:refund|cashback)\s*(?:by|via)\s*pin",
        ],
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
        "recommendations": [
            "Indian police and law enforcement do NOT conduct 'digital arrests' or video-call interrogations.",
            "Do NOT transfer any money to 'safeguard funds' or 'verify innocence'.",
            "Dial 1930 (National Cyber Crime Helpline) or report immediately at cybercrime.gov.in.",
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
        "recommendations": [
            "State electricity boards never send disconnection notices via personal mobile numbers.",
            "Do not call the mobile number listed in the SMS or install any APK file.",
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
        "recommendations": [
            "Banks never send SMS messages with shortened links or APKs to update KYC or PAN details.",
            "Do not click on links in SMS. Use only the official NetBanking portal or mobile banking app.",
            "Report phishing SMS to your bank's official fraud helpline.",
        ],
    },
    {
        "id": "RULE-LOTTERY-PRIZE-FRAUD",
        "category": "LOTTERY_KYC_PHISHING",
        "severity": RiskLevel.HIGH_RISK,
        "name": "Unsolicited Lottery / KBC Prize Fraud",
        "description": "Claims you have won a multi-lakh lottery (e.g. KBC, Lucky Draw) and demands an upfront processing fee to release the prize.",
        "patterns": [
            r"(?:won|congratulations).*?(?:lottery|prize|lucky\s*draw|kbc\s*winner)",
            r"(?:claim|receive)\s*(?:your\s*)?(?:car|cash|prize)\s*(?:worth|of)\s*(?:rs\.?|₹|inr)?\s*[\d,]+",
            r"(?:pay|deposit)\s*(?:processing|registration|gst|tax)\s*fee\s*(?:to\s*claim|for\s*delivery)",
        ],
        "recommendations": [
            "You cannot win a lottery or contest that you never entered.",
            "Never pay any 'advance processing fee', 'customs duty', or 'tax' to receive prize money.",
            "Delete and report the message.",
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
        "recommendations": [
            "Avoid clicking shortened links from unknown numbers.",
            "Check links using a safe URL scanner before opening.",
        ],
    },
]


def evaluate_message(text: str, entities: ExtractedEntities) -> AnalyzeResponse:
    matched_signals: list[AnalysisSignal] = []
    categories: list[str] = []
    all_recommendations: list[str] = []
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
                categories.append(rule["category"])
                all_recommendations.extend(rule["recommendations"])

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
            all_recommendations.append(
                "Do not rush into payments or sharing personal information under artificial urgency."
            )
            highest_severity_rank = max(highest_severity_rank, severity_order[RiskLevel.CAUTION])

    # Determine overall risk
    overall_risk = rank_to_severity[highest_severity_rank]
    primary_category = categories[0] if categories else "INFORMATIONAL_OR_UNKNOWN"
    secondary_categories = list(dict.fromkeys(categories[1:]))

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

    # Deduplicate recommendations preserving order
    deduped_recommendations = list(dict.fromkeys(all_recommendations))

    metadata: dict[str, Any] = {
        "engine": "deterministic-v1",
        "rules_evaluated": len(RULES),
        "signals_detected": len(matched_signals),
    }

    return AnalyzeResponse(
        overall_risk=overall_risk,
        confidence=confidence,
        primary_category=primary_category,
        secondary_categories=secondary_categories,
        signals=matched_signals,
        extracted_entities=entities,
        action_recommendations=deduped_recommendations,
        model_metadata=metadata,
    )
