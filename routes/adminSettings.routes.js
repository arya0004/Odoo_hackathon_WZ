import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { getCompanyUsers, updateUserRole } from "../Controller/adminSettings.controller.js";

const router = express.Router();

// ✅ Fetch all employees of the admin's company
router.get("/settings/users", userAuth, getCompanyUsers);

// ✅ Update a user's role (Admin, HR, Payroll, Employee)
router.put("/settings/update-role/:user_id", userAuth, updateUserRole);

export default router;
