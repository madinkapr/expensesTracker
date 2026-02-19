import express from 'express';
import { config } from 'dotenv';

import { connectDB } from './db/index.js';
import router from './router/index.route.js';

config();

const PORT = Number(process.env.PORT);
const app = express();

app.use(express.json());

await connectDB();

app.use('/api', router)


app.listen(PORT, () => console.log('Server running on port', PORT))
