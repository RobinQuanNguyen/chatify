import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
    try {
        // For testing, we will use a different MongoDB URI to avoid messing with production data. The test runner will set NODE_ENV to "test", so we can check that and use the appropriate URI.
        if (ENV.NODE_ENV === "test") {
            const conn = await mongoose.connect(ENV.MONGO_URI_FOR_TEST);
            console.log("MongoDB for testing connected successfully", conn.connection.host);
        } else {
            const conn = await mongoose.connect(ENV.MONGO_URI);
            console.log("MongoDB connected successfully", conn.connection.host);
        }
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1); // 1 status code means fail, 0 means success
    }
}