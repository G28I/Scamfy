import re

from backend.app.api.v1.schemas.analyze import ExtractedEntities

# Common Indian Banking UPI Handles
UPI_HANDLES = {
    "okhdfcbank",
    "okaxis",
    "oksbi",
    "okicici",
    "paytm",
    "ybl",
    "ibl",
    "axl",
    "apl",
    "sbi",
    "icici",
    "hdfcbank",
    "barodampay",
    "upi",
    "postbank",
    "federal",
    "kotak",
    "indus",
    "pnb",
    "canara",
}

EMAIL_REGEX = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    re.IGNORECASE,
)

UPI_REGEX = re.compile(
    r"\b([a-zA-Z0-9.\-_]{2,64}@([a-zA-Z0-9.\-_]{2,64}))\b",
    re.IGNORECASE,
)

PHONE_REGEX = re.compile(
    r"(?:(?:\+91|91|0)[\s\-]?)?([6-9]\d{9})\b",
)

URL_REGEX = re.compile(
    r"https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)",
    re.IGNORECASE,
)

AMOUNT_REGEX = re.compile(
    r"(?:(?:₹|Rs\.?|INR|\$)\s*[\d,]+(?:\.\d{1,2})?|\b[\d,]+\s*(?:rupees|lakhs?|crores?)\b)",
    re.IGNORECASE,
)

IFSC_REGEX = re.compile(
    r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
)

TELEGRAM_REGEX = re.compile(
    r"(?:t\.me/|@)([a-zA-Z0-9_]{4,32})",
    re.IGNORECASE,
)


def extract_emails(text: str) -> list[str]:
    matches = EMAIL_REGEX.findall(text)
    # Deduplicate while preserving order
    seen = set()
    result = []
    for m in matches:
        m_clean = m.strip()
        if m_clean.lower() not in seen:
            seen.add(m_clean.lower())
            result.append(m_clean)
    return result


def extract_upi_ids(text: str) -> list[str]:
    emails = {e.lower() for e in extract_emails(text)}
    matches = UPI_REGEX.findall(text)
    seen = set()
    result = []
    for full_match, handle in matches:
        clean = full_match.strip()
        lower_clean = clean.lower()
        # If it matches an email with standard domain, exclude unless handle is a known UPI provider
        if lower_clean in emails and handle.lower() not in UPI_HANDLES:
            continue
        if lower_clean not in seen:
            seen.add(lower_clean)
            result.append(clean)
    return result


def extract_phone_numbers(text: str) -> list[str]:
    matches = PHONE_REGEX.findall(text)
    seen = set()
    result = []
    for m in matches:
        clean = m.strip()
        if clean not in seen:
            seen.add(clean)
            result.append(clean)
    return result


def extract_urls(text: str) -> list[str]:
    matches = URL_REGEX.findall(text)
    seen = set()
    result = []
    for m in matches:
        clean = m.strip().rstrip(".,;)")
        if clean.lower() not in seen:
            seen.add(clean.lower())
            result.append(clean)
    return result


def extract_amounts(text: str) -> list[str]:
    matches = AMOUNT_REGEX.findall(text)
    seen = set()
    result = []
    for m in matches:
        clean = m.strip()
        if clean.lower() not in seen:
            seen.add(clean.lower())
            result.append(clean)
    return result


def extract_bank_accounts(text: str) -> list[str]:
    ifscs = IFSC_REGEX.findall(text)
    seen = set()
    result = []
    for code in ifscs:
        clean = f"IFSC: {code.strip()}"
        if clean not in seen:
            seen.add(clean)
            result.append(clean)
    return result


def extract_handles(text: str) -> list[str]:
    matches = TELEGRAM_REGEX.findall(text)
    emails = {e.lower() for e in extract_emails(text)}
    upis = {u.lower() for u in extract_upi_ids(text)}
    seen = set()
    result = []
    for m in matches:
        clean = m.strip()
        # Ignore if it is part of email or UPI prefix
        if any(clean.lower() in e for e in emails) or any(clean.lower() in u for u in upis):
            continue
        formatted = f"@{clean}"
        if formatted.lower() not in seen:
            seen.add(formatted.lower())
            result.append(formatted)
    return result


def extract_all_entities(text: str) -> ExtractedEntities:
    return ExtractedEntities(
        upi_ids=extract_upi_ids(text),
        phone_numbers=extract_phone_numbers(text),
        urls=extract_urls(text),
        emails=extract_emails(text),
        bank_accounts=extract_bank_accounts(text),
        amounts=extract_amounts(text),
        handles=extract_handles(text),
    )
