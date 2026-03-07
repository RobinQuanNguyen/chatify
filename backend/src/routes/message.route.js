import express from 'express';
import { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection, protectRoute); // Apply authentication middleware to all routes in this router

router.get("/check", (req, res) => {
    res.status(200).json({ message: "Authenticated", user: req.user });
});
router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId); // Get messages with a specific user. Use :id to identify the other user in the chat
router.post("/send/:id", sendMessage);

export default router;