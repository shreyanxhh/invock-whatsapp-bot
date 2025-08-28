export const replies = {
    greeting: `Hi! I'm Invock’s assistant. I can answer inventory questions and schedule a demo. Ask anything or say "demo".`,
    inventoryPitch: `Yes—Invock helps with inventory management. Key capabilities:
- Real-time stock tracking (multi-location)
- Low-stock alerts & reorder suggestions
- GRN, purchase, sales & returns
- Batch/expiry, barcode & SKU management
- GST billing and reports
- Integrations: ecommerce/pos/accounting
Shall I take your details to set up a quick demo? (name, email, business)`,
    askName: `Great. What's your full name?`,
    askEmail: `Thanks. What's your email address?`,
    askBusiness: `And your business name?`,
    askWhen: `When should we schedule the demo? (e.g., "25 Aug, 3 PM")`,
    invalidEmail: `That doesn't look like a valid email. Please re-enter.`,
    timeNotUnderstood: `I couldn't understand the time. Try "tomorrow 3 pm" or "25 Aug 11:30 AM".`,
    confirming: d => `Confirming: ${d}. Reply "yes" to confirm or "no" to change.`,
    booked: link => `You're booked! Invite sent. Link: ${link}`,
    help: `You can ask about inventory features, share your details, or say "demo" to schedule.`
};
