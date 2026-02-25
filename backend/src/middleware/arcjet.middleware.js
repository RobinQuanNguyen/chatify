// Write a function that use Arcject to protect routes from bots and malicious traffic. This function should be used as middleware in the Express app to ensure that all incoming requests are evaluated by Arcjet before reaching the route handlers.

import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({message: "Rate limit exceeded. Please try again later."});
            } else if (decision.reason.isBot()) {
                return res.status(403).json({message: "Bot access denied."});
            } else {
                return res.status(403).json({message: "Access denied."});
            }
        } 

        // Check for spoofed bots. Spoofed bot can act like a normal human.
        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                error: "Access denied. Spoofed bot detected.",
                message: "Malicious bot activity detected.",
            });
        }
        next();
    } catch (error) {
        console.log("Error in Arcjet protection middleware", error.message);
        next();
    }
}