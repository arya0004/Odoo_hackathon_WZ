import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { checkIn, checkOut, getStatus, getHistory } from "../Controller/attendance.controller.js";

const router = express.Router();

// ✅ Mark attendance (check-in)
router.post("/checkin", userAuth, checkIn);

// ✅ Check-out employee
router.post("/checkout", userAuth, checkOut);

// ✅ Get today’s status (for color dot)
router.get("/status/:id", userAuth, getStatus);

// ✅ Get attendance history for profile
router.get("/history/:id", userAuth, getHistory);

export default router;
