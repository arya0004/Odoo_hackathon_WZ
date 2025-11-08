import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import upload from "../config/multer.js"; // ✅ using your existing multer config
import {
  applyLeave,
  getMyLeaves,
  getLeaveSummary,
  getAllLeaves,
  updateLeaveStatus,
} from "../Controller/leave.controller.js";

const router = express.Router();

// ✅ Employee applies for leave (with optional attachment)
router.post("/apply", userAuth, upload.single("attachment"), applyLeave);

// ✅ Employee views their own leaves
router.get("/my/:id", userAuth, getMyLeaves);

// ✅ Employee leave summary
router.get("/summary/:id", userAuth, getLeaveSummary);

// ✅ Admin/HR - view all leaves
router.get("/all", userAuth, getAllLeaves);

// ✅ Admin/HR - approve/reject a leave
router.put("/status/:id", userAuth, updateLeaveStatus);

export default router;
