import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './db/connect.js';
import router from './router.js';
import Lead from './db/Lead.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.get('/', (_, res) => res.send('Invock WhatsApp Bot OK'));
app.use('/webhook', router);
app.get('/leads', async (_, res) => res.json(await Lead.find().sort({ createdAt: -1 }).limit(200)));

const port = process.env.PORT || 8080;
await connectDB();
app.listen(port, () => console.log(`Server on :${port}`));