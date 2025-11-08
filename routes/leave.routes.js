import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from "../Controller/leave.controller.js";

const router = express.Router();

// Employee
router.post("/apply", userAuth, applyLeave);
router.get("/my-leaves/:id", userAuth, getMyLeaves);

// HR/Admin
router.get("/all", userAuth, getAllLeaves);
router.put("/update-status/:id", userAuth, updateLeaveStatus);

export default router;
