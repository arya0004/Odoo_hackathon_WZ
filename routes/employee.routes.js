// routes/employee.routes.js
import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { getEmployeeDirectory } from "../Controller/employee.controller.js";

const router = express.Router();

// ✅ Get all employees (read-only)
router.get("/directory", userAuth, getEmployeeDirectory);

export default router;
