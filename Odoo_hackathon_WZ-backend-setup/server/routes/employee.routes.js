// 

// routes/employee.routes.js
import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import {
  getEmployeeDirectory,
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadResume as uploadResumeController,
} from "../Controller/employee.controller.js";
import resumeUpload from "../config/multer.js";

const router = express.Router();

/* ------------------------------------------------------------------ */
/* helpers: scope /directory to a single company                      */
/* ------------------------------------------------------------------ */
const isStaff = (role) => ["Admin", "HR", "Payroll"].includes(String(role || "").trim());

/**
 * Ensures req.query.companyId is set for /directory.
 * - Employees: forced to their own company_id.
 * - Staff (Admin/HR/Payroll): can pass ?companyId=..., otherwise default to their own company_id.
 */
function scopeDirectoryToCompany(req, res, next) {
  const user = req.user || {};
  const myCompanyId = user.company_id;
  const role = user.role;

  if (!isStaff(role)) {
    // Employee token → must be their own company
    if (!myCompanyId) return res.status(400).json({ message: "Company not linked to user." });
    req.query.companyId = String(myCompanyId);
    return next();
  }

  // Staff: allow override via query, else default to their own company (safer than global)
  const requested = req.query.companyId ?? myCompanyId;
  if (!requested) return res.status(400).json({ message: "companyId is required." });
  req.query.companyId = String(requested);
  next();
}

/* ------------------------------------------------------------------ */
/* Profile + Security (Employee)                                      */
/* ------------------------------------------------------------------ */

// ✅ Employee: View / Update own profile
router.get("/myprofile", userAuth, getMyProfile);
router.put("/my-profile", userAuth, updateMyProfile);

// ✅ Employee: Change password
router.put("/change-password", userAuth, changePassword);

// ✅ Employee: Upload resume (PDF/DOC)
router.post(
  "/upload-resume",
  userAuth,
  resumeUpload.single("resume"),
  uploadResumeController
);

/* ------------------------------------------------------------------ */
/* Directory (read-only)                                              */
/* ------------------------------------------------------------------ */

// ✅ Get employees for a single company (scoped)
router.get("/directory", userAuth, scopeDirectoryToCompany, getEmployeeDirectory);

export default router;
