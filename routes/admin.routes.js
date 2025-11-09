import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { adminCreateUser } from "../Controller/admin.controller.js";
import { getEmployeeFullProfile, updateEmployeeFullProfile } from "../Controller/admin.controller.js";
import upload from "../config/multer.js";
import { adminSignup } from "../Controller/admin.controller.js";

const router = express.Router();

// ✅ Only Admin can create new users
router.post("/create-user", userAuth, adminCreateUser);

// 🆕 New route for updating profile

// Admin can view any employee’s full profile
router.get("/employee-profile/:user_id", userAuth, getEmployeeFullProfile);
router.post("/signup", upload.single("company_logo"), adminSignup);
// Admin can update any employee’s full profile
router.put("/employee-profile/:user_id", userAuth, updateEmployeeFullProfile);
export default router;
