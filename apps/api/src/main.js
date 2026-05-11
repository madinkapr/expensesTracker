import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/index.js';
import router from './router/index.route.js';


const PORT = Number(process.env.PORT);
const app = express();

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
)); // CORS ni yoqamiz
app.use(express.json());
app.use(cookieParser());

await connectDB(process.env.MONGO_URI);

app.use('/api', router)


app.listen(PORT, () => console.log('Server running on port', PORT))
