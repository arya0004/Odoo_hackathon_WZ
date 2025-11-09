import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { getCompanyUsers, updateUserRole } from "../Controller/adminSettings.controller.js";
import { getMyProfile } from "../Controller/employee.controller.js";
import { getEmployeeSalaryInfo, updateEmployeeSalaryInfo } from "../Controller/adminSettings.controller.js";


const router = express.Router();

// ✅ Fetch all employees of the admin's company
router.get("/settings/users", userAuth, getCompanyUsers);

// ✅ Update a user's role (Admin, HR, Payroll, Employee)
router.put("/settings/update-role/:user_id", userAuth, updateUserRole);
// router.put("/assign-manager/:employeeId", userAuth, assignManager);

// Get salary info of an employee
router.get("/salary-info/:user_id", userAuth, getEmployeeSalaryInfo);

// Update salary info
router.put("/salary-info/:user_id", userAuth, updateEmployeeSalaryInfo);

router.get("/my-profile", userAuth, getMyProfile);

export default router;