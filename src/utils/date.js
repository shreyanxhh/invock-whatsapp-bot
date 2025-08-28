import * as chrono from "chrono-node";
export function parseWhen(text) {
    const results = chrono.parse(text, new Date(), { forwardDate: true });
    if (!results.length) return null;
    const start = results[0].date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
}
