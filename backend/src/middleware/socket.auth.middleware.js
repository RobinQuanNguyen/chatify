import { jwt } from "jsonwebtoken"
import User from "../models/User.js"
import { ENV } from "../lib/env.js"

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // Extract the token from http-only cookies
        const token = socket.handshake.headers.cookie ?.split("; ") .find((row) => row.startsWith("jwt=")) ?.split("=")[1];

        if (!token) {
            console.log("Socket authentication failed: No token provided");
            return next(new Error("Authentication error: No token provided"));
        }

        // Verify the token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            console.log("Socket authentication failed: Invalid token");
            return next(new Error("Authentication error: Invalid token"));
        }
 
        // Find the user associated with the token
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("Socket authentication failed: User not found");
            return next(new Error("Authentication error: User not found"));
        }

        // Attach user information to the socket object for later use
        socket.user = user;
        socket.userId = user._id.toString(); // Ensure userId is a string for consistent comparisons

        console.log(`Socket authentication successful for user: ${user.username} (ID: ${user._id})`);

        // Proceed to the next middleware or the connection handler
        next();

    } catch (error) {
        console.log("Socket authentication error:", error.message);
        return next(new Error("Authentication error: " + error.message));
    }
}