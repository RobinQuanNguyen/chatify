import express from 'express';
import { protectRoute, requireAdmin } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

import { deleteUserAndData } from '../controllers/admin.controller.js';


const router = express.Router();

router.use(arcjetProtection); // Apply Arcjet protection to all routes in this router

router.get("/check", protectRoute, requireAdmin, (req, res) => {
    res.status(200).json({ message: "User is an admin" });
})

router.delete("/:id", protectRoute, requireAdmin, deleteUserAndData);

export default router;