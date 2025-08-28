import { google } from "googleapis";
function oauth2Client() {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return oAuth2Client;
}
export async function createCalendarEvent({ summary, description, startISO, endISO, attendees }) {
    const auth = oauth2Client();
    const calendar = google.calendar({ version: "v3", auth });
    const event = {
        summary,
        description,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        attendees: (attendees || []).map(e => ({ email: e }))
    };
    const { data } = await calendar.events.insert({
        calendarId: process.env.ORG_CALENDAR_ID || "primary",
        requestBody: event,
        sendUpdates: "all"
    });
    return data;
}
