import jwt from "jsonwebtoken"
import { ENV } from "./env.js";


export const generateToken = (userId, res) => {
    // JWT_SECRET check
    const {JWT_SECRET} = ENV;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({userId:userId}, JWT_SECRET, {
        expiresIn: "7d"
    }); // userID to know which user owns the token

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // only accessible by the server, not by client-side JS
        sameSite: "strict", // only send cookie for same site requests
        secure: ENV.NODE_ENV === "development" ? false : true, // only send cookie over HTTPS in production
    });

    return token;
}