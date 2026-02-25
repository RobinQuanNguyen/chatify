import express from 'express';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { ArcjetChallengeDecision } from '@arcjet/node';

const router = express.Router();

router.use(arcjetProtection); // Apply Arcjet protection to all routes in this router

router.get("/test", (req, res) => {
    res.status(200).json({message: "Test route is working"});
})

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) => {
    res.status(200).json({message: "User is authenticated", user: req.user});
})

export default router;