import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';

import { ENV } from './lib/env.js';


const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // for parsing cookies

app.use("/api/auth", authRoutes); // All routes in authRoutes will be prefixed with /api/auth
app.use("/api/message", messageRoutes); // All routes in messageRoutes will be prefixed with /api/message

// make ready for deployment
if (ENV.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});