import express from "express";
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { createGroup, getMyGroups } from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(arcjetProtection);

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Group route is working" });
    }
);
router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);

//router.post("/add-member", protectRoute, addMember);
//router.post("/remove-member", protectRoute, removeMember);

export default router;