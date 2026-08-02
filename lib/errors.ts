import { ApiError } from "./api";

/**
 * Known Medusa/RMS validation failures worth telling the merchant about
 * specifically (they're actionable - a different SKU, a valid handle - not
 * generic server trouble). Matched against ApiError.detail, which is the
 * extracted upstream message text (English, from Medusa) - checked in order,
 * first match wins. Anything unrecognized falls back to a generic message
 * rather than leaking raw English/JSON/stack traces to the client.
 */
const KNOWN_VALIDATION_PATTERNS: { pattern: RegExp; message: (match: RegExpMatchArray) => string }[] = [
  {
    pattern: /inventory item with sku:?\s*([^,]+),?\s*already exists/i,
    message: (m) => `מק"ט ${m[1].trim()} כבר קיים במערכת. יש לבחור מק"ט אחר.`,
  },
  {
    pattern: /product with handle:?\s*['"]?([^'",.]+)['"]?\s*already exists/i,
    message: (m) => `המזהה (handle) "${m[1].trim()}" כבר קיים במערכת. יש לבחור שם מוצר אחר.`,
  },
  {
    pattern: /invalid product handle.*url safe|handle.*must contain url safe/i,
    message: () =>
      'המזהה (handle) של המוצר מכיל תווים לא תקינים (מותרות אותיות, מספרים ומקפים בלבד). יש לשנות את שם המוצר או לפנות לתמיכה.',
  },
  {
    pattern: /already exists/i,
    message: () => "הערך שהוזן כבר קיים במערכת. יש לבחור ערך אחר.",
  },
  {
    pattern: /must be (a valid|one of|greater than|less than)|is not a valid/i,
    message: () => "אחד מהשדות שהוזנו אינו תקין. יש לבדוק את הנתונים שהוזנו ולנסות שוב.",
  },
  {
    pattern: /required|must be provided|cannot be null|cannot be empty/i,
    message: () => "חסר מידע נדרש לשמירת המוצר. יש לוודא שכל השדות החיוניים מולאו.",
  },
];

function translateKnownValidationError(detail: string): string | null {
  for (const { pattern, message } of KNOWN_VALIDATION_PATTERNS) {
    const match = detail.match(pattern);
    if (match) return message(match);
  }
  return null;
}

/**
 * Converts any thrown value into a Hebrew message safe to show the client.
 *
 * ApiError instances come from callFlow() and carry a raw technical detail
 * (HTTP status, upstream error body) that a merchant can't act on directly -
 * known validation failures are translated into a specific, actionable
 * Hebrew message; anything else falls back to one of a few generic, friendly
 * messages. Any other Error is one this app threw itself with an
 * already-friendly Hebrew message (form validation, image-upload checks) and
 * is passed through unchanged.
 */
export function toFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const known = error.detail ? translateKnownValidationError(error.detail) : null;
    if (known) return known;

    if (error.kind === "network") {
      return "אירעה תקלת תקשורת. יש לבדוק את החיבור לאינטרנט ולנסות שוב.";
    }
    return "אירעה שגיאה בתקשורת עם השרת. יש לנסות שוב בעוד מספר רגעים, ואם התקלה נמשכת יש לפנות לתמיכה.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "אירעה שגיאה לא צפויה.";
}
