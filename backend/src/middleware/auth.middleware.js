import jwt from 'jsonwebtoken'
import { ENV } from '../lib/env.js'
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({message: "Unauthorized. No token provided"});
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({message: "Unauthorized. Invalid token"});
        }

        // Check if user still exists in the database (e.g User was deleted after login, but old token still hasn’t expired.)
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password from user data
        if (!user) {
            return res.status(401).json({message: "Unauthorized. User not found"});
        }

        req.user = user; // Attach user to request object for use in controllers
        
        next(); // so under the next method, we can access req.user to get the authenticated user's data

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized. Invalid token" });
        }

        return res.status(401).json({ message: "Not authorized" });
    }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }
  next();
}

// The flow of protectRoute middleware is as follows:
/* 
1. Extract the JWT token from the request cookies.
2. If no token is found, respond with a 401 Unauthorized status and a message indicating that no token was provided.
3. If a token is found, verify it using the JWT secret. If the token is invalid or expired, respond with a 401 Unauthorized status and a message indicating that the token is invalid.
4. If the token is valid, decode it to get the user ID and check if a user with that ID still exists in the database. If the user does not exist (e.g., they were deleted after logging in), respond with a 401 Unauthorized status and a message indicating that the user was not found.
5. If the user exists, attach the user object (excluding the password) to the request object (req.user) so that it can be accessed in subsequent controllers or middleware.
6. Call next() to pass control to the next middleware or route handler.
*/