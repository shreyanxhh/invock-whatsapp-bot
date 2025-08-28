import axios from 'axios';
const BASE = 'https://graph.facebook.com/v20.0';
const headers = () => ({ Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' });

export async function sendText(to, body) {
	const url = `${BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
	const data = { messaging_product: 'whatsapp', to, type: 'text', text: { body } };
	await axios.post(url, data, { headers: headers() });
}

export async function fetchMediaUrl(mediaId) {
	const url = `${BASE}/${mediaId}`;
	const { data } = await axios.get(url, { headers: headers() });
	return data.url;
}

export async function download(url) {
	const { data } = await axios.get(url, { responseType: 'arraybuffer', headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } });
	return Buffer.from(data);
}