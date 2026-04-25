import express from 'express';
import cors from 'cors';

import { connectDB } from './db/index.js';
import router from './router/index.route.js';


const PORT = Number(process.env.PORT);
const app = express();

app.use(cors()); // CORS ni yoqamiz
app.use(express.json());

await connectDB(process.env.MONGO_URI);

app.use('/api', router)


app.listen(PORT, () => console.log('Server running on port', PORT))
