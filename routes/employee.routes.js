// routes/employee.routes.js
import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { getEmployeeDirectory } from "../Controller/employee.controller.js";
import { getMyProfile, updateMyProfile,changePassword } from "../Controller/employee.controller.js";
const router = express.Router();



// ✅ Employee: View My Profile
router.get("/myprofile", userAuth, getMyProfile);
router.put("/my-profile", userAuth, updateMyProfile);
router.put("/change-password", userAuth, changePassword);


import resumeUpload from "../config/multer.js"; // <-- multer middleware
import { uploadResume } from "../Controller/employee.controller.js"; // <-- controller function
router.post(
  "/upload-resume",
  userAuth,
  resumeUpload.single("resume"), // <-- multer instance
  uploadResume                    // <-- controller
);



// ✅ Get all employees (read-only)
router.get("/directory", userAuth, getEmployeeDirectory);

export default router;
