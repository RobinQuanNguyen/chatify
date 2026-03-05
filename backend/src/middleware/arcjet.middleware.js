// Write a function that use Arcject to protect routes from bots and malicious traffic. This function should be used as middleware in the Express app to ensure that all incoming requests are evaluated by Arcjet before reaching the route handlers.

import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";
import { ENV } from "../lib/env.js";
 
export const arcjetProtection = async (req, res, next) => {
    try {
        const arcjetOn = ENV.ARCJET_ENABLED === "true";
        // For testing purposes, arject will be off in test mode to avoid interference with tests. In production, it will be active to protect against bots and malicious traffic.
        if (!arcjetOn) {
            console.log("Arcjet protection middleware will not be active in test mode. But if the test is set to test arcjet, it will be active.");
            return next();
        }
        
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({message: "Rate limit exceeded. Please try again later."});
            } else if (decision.reason.isBot()) {
                return res.status(403).json({message: "Bot access denied by Arcjet."});
            } else {
                return res.status(403).json({message: "Access denied by Arcjet."});
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