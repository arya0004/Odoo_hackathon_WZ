import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import { checkIn, checkOut, getStatus, getHistory } from "../Controller/attendance.controller.js";
import { getEmployeeMonthlyAttendance ,getAdminAttendanceByDate} from "../Controller/attendance.controller.js";


const router = express.Router();

// ✅ Mark attendance (check-in)
router.post("/checkin", userAuth, checkIn);

// ✅ Check-out employee
router.post("/checkout", userAuth, checkOut);

// ✅ Get today’s status (for color dot)
router.get("/status/:id", userAuth, getStatus);

// ✅ Get attendance history for profile
router.get("/history/:id", userAuth, getHistory);

// Get attendance for logged-in employee (monthly view)
// router.get("/monthly/:id", userAuth, getMonthlyAttendance);

// Get attendance for all employees (Admin)
// router.get("/all", userAuth, getAllAttendance);
router.get("/employee/:id/:month", userAuth, getEmployeeMonthlyAttendance);

// ✅ Admin/HR route for attendance dashboard
router.get("/admin/date", userAuth, getAdminAttendanceByDate);





export default router;
