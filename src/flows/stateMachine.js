import Session from "../db/Session.js";
import Lead from "../db/Lead.js";
import { replies } from "./replyTexts.js";
import { detectIntent, extractEmail } from "./intents.js";
import { parseWhen } from "../utils/date.js";
import { createCalendarEvent } from "../calendar/calendar.js";
import { sendText } from "../whatsapp.js";

export async function handleIncoming({ from, text }) {
    const session = await Session.findOneAndUpdate(
        { waPhone: from },
        { $setOnInsert: { waPhone: from } },
        { new: true, upsert: true }
    );

    const say = (m) => sendText(from, m);
    const intent = detectIntent(text);

    if (session.state === "ASK_NAME") {
        session.context.fullName = text?.trim();
        session.state = "ASK_EMAIL";
        await session.save();
        return say(replies.askEmail);
    }

    if (session.state === "ASK_EMAIL") {
        const email = extractEmail(text);
        if (!email) return say(replies.invalidEmail);
        session.context.email = email;
        session.state = "ASK_BUSINESS";
        await session.save();
        return say(replies.askBusiness);
    }

    if (session.state === "ASK_BUSINESS") {
        session.context.business = text?.trim();
        session.state = "ASK_WHEN";
        await session.save();
        return say(replies.askWhen);
    }

    if (session.state === "ASK_WHEN") {
        const when = parseWhen(text);
        if (!when) return say(replies.timeNotUnderstood);
        session.context.when = when;
        session.state = "CONFIRM";
        await session.save();
        const d = `${session.context.fullName}, ${session.context.email}, ${session.context.business}, ${new Date(when.startISO).toLocaleString()}`;
        return say(replies.confirming(d));
    }

    if (session.state === "CONFIRM") {
        if (intent === "yes") {
            const { fullName, email, business, when } = session.context;
            await Lead.create({ waPhone: from, fullName, email, business, intent: "demo" });
            const event = await createCalendarEvent({
                summary: `Invock Demo - ${fullName}`,
                description: `Lead from WhatsApp (${from}) - Business: ${business}`,
                startISO: when.startISO,
                endISO: when.endISO,
                attendees: [email]
            });
            session.state = "IDLE";
            session.context = {};
            await session.save();
            return say(replies.booked(event.hangoutLink || event.htmlLink || "Created"));
        } else if (intent === "no") {
            session.state = "ASK_WHEN";
            await session.save();
            return say(replies.askWhen);
        }
    }

    if (intent === "greet") return say(replies.greeting);

    if (intent === "inventory_query") {
        await say(replies.inventoryPitch);
        if (session.state === "IDLE") {
            session.state = "ASK_NAME";
            await session.save();
            return say(replies.askName);
        }
        return;
    }

    if (intent === "schedule_demo") {
        if (!session.context.fullName) { session.state = "ASK_NAME"; await session.save(); return say(replies.askName); }
        if (!session.context.email) { session.state = "ASK_EMAIL"; await session.save(); return say(replies.askEmail); }
        if (!session.context.business) { session.state = "ASK_BUSINESS"; await session.save(); return say(replies.askBusiness); }
        session.state = "ASK_WHEN";
        await session.save();
        return say(replies.askWhen);
    }

    return say(replies.help);
}
