import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { adminCreateUser } from "../Controller/admin.controller.js";

const router = express.Router();

// ✅ Only Admin can create new users
router.post("/create-user", userAuth, adminCreateUser);

export default router;
