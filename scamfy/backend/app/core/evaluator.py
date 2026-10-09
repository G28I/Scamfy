import re
from typing import Any
from urllib.parse import urlparse

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
    {
        "id": "RULE-MONEY-MULE-FORWARDING",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Money Mule Fund Forwarding Lure",
        "description": "The message solicits receiving third-party funds into a personal bank or UPI account and forwarding or converting them in exchange for a commission.",
        "patterns": [
            r"(?:receive|accept|get|deposit)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|money|funds|payments?|cash).*?(?:in|into|to)\s+.*?(?:bank|savings|current|upi|account|wallet|vpa).*?(?:forward|transfer|send|convert|withdraw|pass)",
            r"(?:transfer|forward|send|wire)\s+.*?(?:remaining|rest|balance|funds|amount).*?(?:keep|take|deduct|retain)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|\d+%\s*|a\s*(?:cut|share|commission|part)|commission|cut|share|profit|percent|%)",
            r"(?:keep|earn|take|get|deduct)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|\d+%\s*|a\s*(?:cut|share|commission|part)|commission|cut|share|profit|percent|%).*?(?:transfer|forward|send|wire|return)\s+.*?(?:to|back|remaining|balance|rest|upi|bank|account)",
            r"(?:payment|transfer|financial)\s*assistant.*?(?:receive|accept|deposit).*?(?:forward|send|crypto|usdt|cash|atm)",
            r"(?:buy|purchase|convert\s*(?:to|into)?)\s+.*?(?:usdt|crypto|gift\s*cards?|bitcoins?)\s+.*?(?:with|using|from)\s+.*?(?:received|credited|deposited|funds|money)",
            r"(?:deposit|receive|get)\s+.*?(?:into|in|to)\s+.*?(?:account|bank|wallet).*?(?:buy|convert|purchase)\s+.*?(?:usdt|crypto|gift\s*card)",
        ],
        "tactics": ["Commission / Easy Money Lure", "Layering / Mule Exploitation"],
        "recommendations": [
            "CRITICAL: Do NOT receive or forward third-party funds through your personal bank account or UPI.",
            "Allowing your account to route unsolicited funds risks immediate bank debit holds and law enforcement scrutiny.",
            "Refuse the proposal and do not touch, spend, or transfer any unsolicited funds.",
        ],
    },
    {
        "id": "RULE-ACCOUNT-RENTAL-P2P",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Bank Account / UPI Rental & Campus Procuring Scheme",
        "description": "Solicits renting, leasing, sharing, or procuring personal or corporate bank accounts, current accounts, or UPI handles for gaming payouts, crypto P2P arbitrage, or betting operations.",
        "patterns": [
            r"(?:rent|lease|share|provide|lend|give|procure|arrange)\s+.*?(?:bank|savings|current|corporate|upi|crypto)\s+.*?(?:account|id|handle|vpa).*?(?:daily|weekly|monthly|commission|crypto|gaming|p2p|arbitrage|rent)",
            r"(?:need|wanted|looking\s*for)\s+.*?(?:current|savings|bank)\s*(?:account|accounts).*?(?:for\s+)?(?:p2p|crypto|arbitrage|gaming|commission|daily\s*rent)",
            r"(?:earn|get|make)\s+.*?(?:daily|per\s*day|monthly).*?(?:renting|providing|giving|sharing|arranging)\s+.*?(?:bank\s*)?account",
            r"(?:daily|weekly)\s*rent\s+.*?(?:for|of)\s+.*?(?:bank|current|savings|upi)\s*account",
            r"(?:telegram|whatsapp|instagram|campus).*?(?:rent|procure|arrange|provide).*?(?:bank|savings|current|upi)\s*account.*?(?:daily|rent|commission|fee)",
            r"(?:rent|share)\s+(?:your\s+)?(?:upi\s*id|google\s*pay|phonepe|paytm)\s+(?:for\s+)?(?:daily\s*rent|daily\s*income|commission)",
        ],
        "tactics": [
            "Account Rental Lure",
            "Identity Shielding Exploitation",
            "Campus Network Recruitment",
        ],
        "recommendations": [
            "Never rent, lease, share, or arrange your bank account, NetBanking, or UPI credentials with third parties.",
            "Account holders remain legally and financially responsible for all transactions passing through their accounts.",
            "Report and block any contact soliciting account sharing or rental on Telegram, WhatsApp, or campus groups.",
        ],
    },
    {
        "id": "RULE-OVERPAYMENT-REVERSAL-MULE",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Accidental Overpayment & Third-Party Reversal Lure",
        "description": "The sender claims to have sent excess money by mistake and urgently requests a refund or transfer to a different account or UPI ID.",
        "patterns": [
            r"(?:sent|transferred|credited|paid)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|excess|extra|money|amount|funds)\b.{0,60}?(?:mistakenly|accidentally|wrongly|by\s*mistake|in\s*error).{0,80}?(?:(?:send|transfer|refund|return|pay)(?:\s+(?:it|them|the\s*(?:excess|extra|difference|amount|money|funds|rest)|(?:rs\.?|₹|inr)?\s*[\d,]+))?\s*back|(?:send|transfer|refund|return|pay\s*back)\s+(?:the\s*(?:excess|extra|difference|amount|money|funds|rest)|(?:rs\.?|₹|inr)?\s*[\d,]+|it\s+to|them\s+to))",
            r"(?:mistakenly|accidentally|wrongly|by\s*mistake)\s+(?:sent|transferred|credited|paid)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|excess|extra|money|amount|funds)\b.{0,80}?(?:(?:send|transfer|refund|return|pay)(?:\s+(?:it|them|the\s*(?:excess|extra|difference|amount|money|funds|rest)|(?:rs\.?|₹|inr)?\s*[\d,]+))?\s*back|(?:send|transfer|refund|return|pay\s*back)\s+(?:the\s*(?:excess|extra|difference|amount|money|funds|rest)|(?:rs\.?|₹|inr)?\s*[\d,]+|it\s+to|them\s+to))",
            r"(?:refund|return|send\s*back|transfer\s*back)\s+(?:extra|excess|difference|money|amount|funds).*?(?:to\s+)?(?:this|another|different|other|my\s*friend)",
            r"(?:keep|deduct)\s+(?:(?:rs\.?|₹|inr)?\s*[\d,]+|\d+%\s*|some\s*(?:money|amount|cash)|commission|cut|share|part)\s*(?:for\s*your\s*(?:trouble|help))?.*?(?:send|refund|transfer|forward)\s+(?:back|the\s*rest|remaining)",
        ],
        "tactics": ["Fake Mistake Deception", "Third-Party Routing Trap"],
        "recommendations": [
            "Do NOT transfer money back to a different UPI ID or account provided by an unknown caller.",
            "Instruct the sender to raise an official dispute through their own banking app for authorized reversal.",
            "If unsolicited funds were credited, notify your bank immediately in writing to place a temporary debit hold on that transaction amount.",
        ],
    },
    {
        "id": "RULE-MULE-LOAN-ASSISTANCE-PRETEXT",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Loan Assistance & Banking Instrument Harvesting Mule Lure",
        "description": "Solicits personal bank accounts, blank signed cheques, debit cards, or fund routing under the guise of loan approval, loan assistance, or fake bank DSA processing.",
        "patterns": [
            r"(?:loan\s*(?:assistance|approval|dsa|processing|sanction|disbursement)|instant\s*loan|education\s*loan|pancard\s*loan|mudra\s*loan)\b.{0,100}?(?:send|courier|handover|provide|give|share|mail)\b.{0,60}?(?:blank\s*signed\s*cheques?|cheque\s*books?|debit\s*cards?|atm\s*cards?|passbooks?|sim\s*cards?|sim\s*kits?|netbanking)",
            r"(?:send|courier|handover|provide|give|share|mail)\b.{0,60}?(?:blank\s*signed\s*cheques?|cheque\s*books?|debit\s*cards?|atm\s*cards?|passbooks?|sim\s*cards?|sim\s*kits?|netbanking)\b.{0,100}?(?:for\s*(?:your\s*)?)?(?:loan\s*(?:assistance|approval|dsa|processing|sanction|disbursement)|instant\s*loan|education\s*loan)",
            r"(?:loan\s*(?:assistance|approval|dsa|processing|sanction|disbursement)|instant\s*loan|education\s*loan)\b.{0,120}?(?:receive|deposit|disburse)\b.{0,60}?(?:in|into|to)\s+(?:your\s+)?(?:account|bank|savings)\b.{0,80}?(?:forward|transfer|send|wire|pay\s*to)\b.{0,60}?(?:company|agency|dsa|corporate|third\s*party|client)",
            r"(?:need|use)\s+(?:your\s+)?(?:bank\s*)?account\s+(?:temporarily\s+)?to\s+(?:process|disburse|sanction|approve)\s+(?:your\s+)?loan",
        ],
        "tactics": ["Loan Assistance Bait", "Instrument Harvesting / Layering"],
        "recommendations": [
            "CRITICAL: Legitimate lenders and DSAs NEVER ask to use your personal account to route third-party funds or demand blank signed cheques / debit cards.",
            "Never courier or surrender blank cheques, debit cards, SIM cards, or NetBanking logins for loan sanction.",
            "Apply for loans only through RBI-registered banks or verified NBFCs.",
        ],
    },
    {
        "id": "RULE-MULE-SCHOLARSHIP-JOB-COMMISSION",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Fake Scholarship & Job Payment Routing / Arranging Lure",
        "description": "Recruits students or jobseekers under scholarship, internship, or part-time job pretexts to receive and forward third-party funds or arrange peer bank accounts for commissions.",
        "patterns": [
            r"(?:scholarship|education\s*grant|stipend\s*program|student\s*aid|fee\s*assistance)\b.{0,120}?(?:receive|accept|deposit)\b.{0,60}?(?:in|into|to)\s+(?:your\s+)?(?:account|bank|upi|vpa)\b.{0,80}?(?:forward|transfer|send|wire|keep\s+(?:a\s+)?(?:cut|commission|\d+%\s*))",
            r"(?:scholarship|student\s*(?:scheme|grant|aid))\b.{0,100}?(?:arrange|procure|provide|collect)\b.{0,60}?(?:student|peer|friend|college|bank)\s*accounts?\b.{0,60}?(?:commission|cut|percentage|₹|rs\.?)",
            r"(?:part[\s-]?time\s*job|work\s*from\s*home|finance\s*assistant|payment\s*(?:operator|assistant|clerk)|internship)\b.{0,120}?(?:use|using)\s+(?:your\s+)?(?:personal\s+)?(?:bank\s*account|savings\s*account|upi|google\s*pay|phonepe|paytm)\b.{0,80}?(?:process|receive|route)\b.{0,60}?(?:company|client|customer)\s*payments?",
            r"(?:arrange|procure|recruit|gather)\s+(?:bank\s*accounts?|savings\s*accounts?|upi\s*ids?)\s+(?:of\s+)?(?:students?|friends?|peers?|others?)\b.{0,60}?(?:commission|cut|share|profit|earn|₹|rs\.?)",
            r"(?:receive|route|process)\s+(?:company|client|customer)\s*funds?\s+(?:through|in|via)\s+(?:your\s+)?(?:personal\s+)?(?:bank|account|upi)\b.{0,60}?(?:keep|earn)\s+(?:commission|cut|\d+%)",
        ],
        "tactics": [
            "Education/Job Masquerade",
            "Student Peer Arranging Lure",
            "Commission Lure",
        ],
        "recommendations": [
            "CRITICAL: Legitimate scholarships and employers NEVER ask students to route company/client funds through personal accounts or arrange peer accounts.",
            "Do not accept, forward, or arrange bank accounts for commissions or stipends.",
            "Refuse the offer and report the communication to campus authorities and 1930.",
        ],
    },
    {
        "id": "RULE-MULE-BANKING-INSTRUMENT-CAPTURE",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Banking Instrument, SIM Kit & Credential Surrender Demand",
        "description": "Explicit demand to surrender or share blank signed cheques, ATM/debit cards, cheque books, NetBanking credentials, UPI PINs, OTPs, or SIM cards for financial operations.",
        "patterns": [
            r"(?:send|courier|handover|provide|give|share|surrender|mail)\s+(?:us\s+)?(?:[\d\w]+\s+)?blank\s*signed\s*cheques?",
            r"(?:send|courier|handover|provide|give|surrender|mail)\s+(?:your\s+)?(?:debit\s*card|atm\s*card|cheque\s*book|passbook\s*kit|sim\s*kit)\s*(?:and|with|,)?\s*(?:pin|welcome\s*kit|password)?",
            r"(?:share|provide|send|disclose|give|surrender|tell)\s+(?:us\s+)?(?:your\s+)?(?:netbanking|mobile\s*banking)\s*(?:user\s*id|username|login)?\s*(?:and\s*)?(?:password|credentials?|pin|mpin)",
            r"(?:send|share|provide|disclose|give|surrender|tell)\s+(?:us\s+)?(?:your\s+)?(?:upi\s*pin|mpin|atm\s*pin|google\s*pay\s*pin|phonepe\s*pin|paytm\s*pin|banking\s*pin)\b",
            r"(?:forward|share|provide|send)\b.{0,40}?(?:bank\s*)?otps?\b.{0,60}?(?:to\s+(?:us|our|manager)|so\s+(?:we|they|someone)\s+can\s+operate)",
            r"(?:handover|give|share|surrender)\s+(?:your\s+)?(?:registered\s+)?sim\s*card\s+(?:and|for)\s+(?:bank|account|banking\s*operations?)",
        ],
        "tactics": ["Credential Harvesting", "Physical Instrument Extortion / Surrender"],
        "recommendations": [
            "CRITICAL: Never share or courier blank signed cheques, debit cards, passbooks, or registered SIM cards to anyone.",
            "Never disclose NetBanking passwords, UPI PINs, or forward OTPs. Banks and employers never request these.",
            "If you have already surrendered banking instruments, contact your bank immediately to block the cards/cheques and freeze account access.",
        ],
    },
    {
        "id": "RULE-MULE-INTERMEDIARY-REASSURANCE",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Deceptive Intermediary Reassurance & Fund Routing Lure",
        "description": "Minimizes legal/financial risk with deceptive reassurances ('only an intermediary', 'harmless', 'no risk') while instructing fund receipt, account sharing, or money forwarding.",
        "patterns": [
            r"(?:only\s+(?:an?\s+)?intermediary|just\s+helping\s+transfer|completely\s+harmless|no\s*risk\s*(?:at\s*all|to\s*you)?|not\s*(?:be\s*)?responsible|used\s+temporarily)\b.{0,120}?(?:receive|transfer|forward|send|keep\s+(?:commission|cut|\d+%)|bank\s*account|upi)",
            r"(?:receive|transfer|forward|send|keep\s+(?:commission|cut|\d+%)|bank\s*account|upi)\b.{0,120}?(?:only\s+(?:an?\s+)?intermediary|just\s+helping\s+transfer|completely\s+harmless|no\s*risk\s*(?:at\s*all|to\s*you)?|not\s*(?:be\s*)?responsible|used\s+temporarily)",
        ],
        "tactics": ["Deceptive Risk Minimization", "Third-Party Shielding"],
        "recommendations": [
            "CRITICAL: Claiming you are 'only an intermediary' or that 'there is no risk' does NOT protect you from legal and financial consequences.",
            "Account holders are held accountable for transactions passing through their personal accounts under cybercrime and money laundering laws.",
            "Do not allow anyone to route funds through your account under promises of temporary or harmless usage.",
        ],
    },
    {
        "id": "RULE-MULE-CORPORATE-ACCOUNT-CREATION",
        "category": "MONEY_MULE_RECRUITMENT",
        "severity": RiskLevel.CRITICAL,
        "name": "Third-Party / Corporate Mule Account Opening Scheme",
        "description": "Solicits opening a bank account, UPI identity, or wallet in an individual's name for a company, client, or third party to operate, often with upfront payment or commission.",
        "patterns": [
            r"(?:open|create|register)\s+(?:a\s+)?(?:new\s+)?(?:bank|savings|current|salary)\s*account\b.{0,80}?(?:in|under)\s+(?:your\s+name|your\s+pan|your\s+aadhaar)\b.{0,100}?(?:for\s+.*?(?:company|client|business|agency|crypto|gaming|firm)\s+to\s+(?:use|operate|run)|and\s+handover)",
            r"(?:open\s+(?:an?|bank)\s*account\s+for\s+(?:our\s+)?(?:company|client|firm))\b.{0,80}?(?:earn|pay\s*you|monthly|commission|₹|rs\.?)",
            r"(?:open|provide)\s+(?:current|savings)\s*accounts?\s+under\s+your\s+name\b.{0,60}?(?:for\s+(?:our\s+)?(?:crypto|p2p|betting|gaming|firm)|we\s+will\s+operate)",
        ],
        "tactics": ["Identity Exploitation", "Corporate Proxy Creation"],
        "recommendations": [
            "CRITICAL: Never open a bank account or UPI identity in your name for someone else or a third-party company to operate.",
            "Opening an account in your name for external use makes you the designated account owner responsible for any fraud committed using that account.",
            "Refuse requests to create accounts or register company current accounts under your PAN/Aadhaar.",
        ],
    },
]


KNOWN_SHORTENER_HOSTS = {
    "bit.ly",
    "tinyurl.com",
    "is.gd",
    "t.co",
    "cutt.ly",
    "rb.gy",
    "shorturl.at",
}


def _get_url_hostname(url_str: str) -> str:
    """Extract and normalize hostname from URL string."""
    candidate = url_str if "://" in url_str else f"http://{url_str}"
    try:
        parsed = urlparse(candidate)
        host = (parsed.netloc or parsed.path).split("/")[0].lower()
        if ":" in host:
            host = host.split(":")[0]
        return host
    except Exception:
        return ""


def _is_shortener_url(url_str: str) -> bool:
    """Check if URL belongs to a recognized URL shortener domain by hostname."""
    host = _get_url_hostname(url_str)
    if not host:
        return False
    return any(host == s or host.endswith("." + s) for s in KNOWN_SHORTENER_HOSTS)


def detect_missing_evidence(
    text: str, entities: ExtractedEntities, matched_rules: list[dict[str, Any]]
) -> list[str]:
    """Identify missing corroborating evidence per DET-05."""
    missing: list[str] = []

    has_critical_or_high = any(
        r["severity"] in (RiskLevel.CRITICAL, RiskLevel.HIGH_RISK) for r in matched_rules
    )

    if has_critical_or_high:
        non_shortener_urls = [u for u in entities.urls if not _is_shortener_url(u)]
        has_shortener_urls = any(_is_shortener_url(u) for u in entities.urls)

        if not non_shortener_urls and not entities.emails:
            missing.append(
                "No verifiable corporate domain, official email header, or sender identity."
            )
        if has_shortener_urls:
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
        if any(r["category"] == "MONEY_MULE_RECRUITMENT" for r in matched_rules):
            missing.append(
                "No formal employment contract, verified corporate remittance authorization, or authentic RBI-registered lender credentials."
            )

    return missing


def evaluate_message(text: str, entities: ExtractedEntities) -> AnalyzeResponse:
    """Evaluate text content and extracted entities against deterministic scam detection rules.

    Args:
        text: Raw message text to evaluate for deceptive or fraudulent patterns.
        entities: Structured entities (UPI IDs, URLs, phone numbers, amounts) extracted from the message.

    Returns:
        AnalyzeResponse containing overall risk rating, matched signals, primary category,
        psychological tactics, missing corroborating evidence, and defensive recommendations.
    """
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

    # Determine overall risk and primary category (prioritizing highest severity matched rule)
    overall_risk = rank_to_severity[highest_severity_rank]
    if matched_rules:
        highest_rule = max(matched_rules, key=lambda r: severity_order[r["severity"]])
        primary_category = highest_rule["category"]
        other_categories = [c for c in categories if c != primary_category]
        secondary_categories = list(dict.fromkeys(other_categories))
    elif categories:
        primary_category = categories[0]
        secondary_categories = list(dict.fromkeys(categories[1:]))
    else:
        primary_category = "INFORMATIONAL_OR_UNKNOWN"
        secondary_categories = []

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
