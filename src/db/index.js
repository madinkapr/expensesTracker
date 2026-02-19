import { connect } from 'mongoose';
import { config } from 'dotenv';


config();

export async function connectDB() {
    try {
        await connect(process.env.MONGO_URI);
        console.log('Connected database!');
    } catch (error) {
        console.log('Error connecting to the database', error);
    }
}