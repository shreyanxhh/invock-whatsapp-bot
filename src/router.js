import express from 'express';
import { handleIncoming } from './flows/stateMachine.js';
import { fetchMediaUrl, download } from './whatsapp.js';

const router = express.Router();

router.get('/', (req, res) => {
	const mode = req.query['hub.mode'];
	const token = req.query['hub.verify_token'];
	const challenge = req.query['hub.challenge'];
	if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(challenge);
	return res.sendStatus(403);
});

router.post('/', async (req, res) => {
	try {
		const entry = req.body.entry?.[0]?.changes?.[0]?.value;
		const message = entry?.messages?.[0];
		if (!message) return res.sendStatus(200);
		const from = message.from;
		let text = message.text?.body;

		if (message.type === 'audio' || message.type === 'voice') {
			const mediaId = message.audio?.id || message.voice?.id;
			const url = await fetchMediaUrl(mediaId);
			await download(url);
			text = '(audio received; transcription disabled)';
		}

		await handleIncoming({ from, text });
		res.sendStatus(200);
	} catch (e) {
		console.error(e);
		res.sendStatus(200);
	}
});

export default router;