import express from 'express';
import { protectRoute, requireAdmin } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

import { deleteUserAndData, deleteMessage } from '../controllers/admin.controller.js';


const router = express.Router();

router.use(arcjetProtection); // Apply Arcjet protection to all routes in this router

router.get("/check", protectRoute, requireAdmin, (req, res) => {
    res.status(200).json({ message: "User is an admin" });
})

router.delete("/delete-user/:id", protectRoute, requireAdmin, deleteUserAndData);
router.delete("/delete-message/:text", protectRoute, requireAdmin, deleteMessage);

export default router;