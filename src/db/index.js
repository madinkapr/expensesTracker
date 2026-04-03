import { connect } from 'mongoose';

export async function connectDB(uri) {
    try {
        await connect(uri);
        console.log('Connected database!');
    } catch (error) {
        console.log('Error connecting to the database', error.message);
        process.exit(1);
    }
}