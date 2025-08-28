export function detectIntent(text) {
    const t = (text || "").toLowerCase();
    if (!t) return "unknown";
    if (/(hi|hello|hey)\b/.test(t)) return "greet";
    if (/(inventory|stock|warehouse|gst|billing|barcode)/.test(t)) return "inventory_query";
    if (/\bdemo\b|\bmeet|\bschedule|\bcall\b/.test(t)) return "schedule_demo";
    if (/\byes\b/.test(t)) return "yes";
    if (/\bno\b/.test(t)) return "no";
    return "unknown";
}
export function extractEmail(text) {
    const m = (text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return m ? m[0] : null;
}
