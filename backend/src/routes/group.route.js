import express from "express";
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { createGroup, getAllMyGroups, getGroupById } from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();
router.use(arcjetProtection);

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Group route is working" });
    }
);
router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getAllMyGroups);
router.get("/:groupId", protectRoute, getGroupById);

//router.post("/add-member", protectRoute, addMember);
//router.post("/remove-member", protectRoute, removeMember);

export default router;