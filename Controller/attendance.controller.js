// server/Controller/attendance.controller.js
import { Attendance ,User} from "../config/db.js";
import { Sequelize } from "sequelize";
import { userAuth } from "../middleware/user.middleware.js";

// Utility to get today's date (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split("T")[0];

// ✅ Check-In
// ✅ Check-In
export const checkIn = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ FIXED HERE
    if (!userId) return res.status(401).json({ message: "Unauthorized: invalid token" });

    const today = getTodayDate();

    const existing = await Attendance.findOne({ where: { user_id: userId, date: today } });
    if (existing) {
      return res.status(400).json({ message: "You have already checked in today!" });
    }

    const created = await Attendance.create({
      user_id: userId,
      date: today,
      status: "Present",
      check_in: Sequelize.literal("CURRENT_TIME()"),
    });

    return res.status(200).json({
      message: "✅ Checked in successfully!",
      attendance_id: created.attendance_id,
    });
  } catch (error) {
    console.error("checkIn error:", error);
    return res.status(500).json({ message: "Server error during check-in" });
  }
};

// ✅ Check-Out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ FIXED HERE
    if (!userId) return res.status(401).json({ message: "Unauthorized: invalid token" });

    const today = getTodayDate();

    const record = await Attendance.findOne({ where: { user_id: userId, date: today } });
    if (!record) {
      return res.status(404).json({ message: "No check-in record found for today" });
    }

    if (record.check_out) {
      return res.status(400).json({ message: "You’ve already checked out today!" });
    }

    await record.update({ check_out: Sequelize.literal("CURRENT_TIME()") });

    return res.status(200).json({ message: "✅ Checked out successfully!" });
  } catch (error) {
    console.error("checkOut error:", error);
    return res.status(500).json({ message: "Server error during check-out" });
  }
};

// ✅ Get Today’s Status (for UI dot)
export const getStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const today = getTodayDate();

    const record = await Attendance.findOne({ where: { user_id: userId, date: today } });

    if (!record) return res.json({ status: "Absent" });

    return res.json({ status: record.status });
  } catch (error) {
    console.error("getStatus error:", error);
    return res.status(500).json({ message: "Error fetching status" });
  }
};

// ✅ Get Attendance History
export const getHistory = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const history = await Attendance.findAll({
      where: { user_id: userId },
      order: [["date", "DESC"]],
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error("getHistory error:", error);
    return res.status(500).json({ message: "Error fetching attendance history" });
  }
};

// Employee monthly view
export const getMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.params.id;
    const { month } = req.query; // e.g., ?month=2025-11
    const records = await Attendance.findAll({
      where: {
        user_id: userId,
        date: { [Op.like]: `${month}%` },
      },
      order: [["date", "ASC"]],
    });

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const leaveDays = records.filter(r => r.status === "Leave").length;

    res.json({
      totalDays,
      presentDays,
      leaveDays,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly attendance" });
  }
};

// Admin view
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query; // e.g., ?date=2025-11-08
    const records = await Attendance.findAll({
      where: { date },
      include: { model: User, attributes: ["name", "email", "role"] },
    });

    res.json({ date, records });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all employee attendance" });
  }
};

import {  Leave } from "../config/db.js";
import { Op } from "sequelize";

// ✅ Fetch employee monthly attendance with summary
export const getEmployeeMonthlyAttendance = async (req, res) => {
  try {
    const { id, month } = req.params; // e.g., id=1, month="2025-11"

    // 1️⃣ Fetch all attendance entries for that month
    const attendances = await Attendance.findAll({
      where: {
        user_id: id,
        date: { [Op.like]: `${month}%` },
      },
      order: [["date", "ASC"]],
    });

    // 2️⃣ Count present, total, etc.
    const presentCount = attendances.filter(a => a.status === "Present").length;
    const totalDays = attendances.length;

    // 3️⃣ Fetch approved leaves for that month
    const leaves = await Leave.findAll({
      where: {
        user_id: id,
        status: "Approved",
        [Op.or]: [
          { start_date: { [Op.like]: `${month}%` } },
          { end_date: { [Op.like]: `${month}%` } },
        ],
      },
    });

    const leaveCount = leaves.length;

    // 4️⃣ Response to frontend
    return res.status(200).json({
      summary: {
        presentCount,
        leaveCount,
        totalDays,
      },
      attendanceData: attendances,
    });
  } catch (error) {
    console.error("❌ Error fetching employee monthly attendance:", error);
    return res.status(500).json({
      message: "Server error fetching monthly attendance",
    });
  }
};

// ✅ Admin/HR fetch attendance for selected date
export const getAdminAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query; // e.g. ?date=2025-10-22
    const targetDate = date || new Date().toISOString().split("T")[0];

    // 1️⃣ Fetch all users
    const users = await User.findAll({
      attributes: ["user_id", "name", "role"],
    });

    // 2️⃣ Fetch attendance for the given date
    const records = await Attendance.findAll({
      where: { date: targetDate },
      include: [{ model: User, attributes: ["name", "role"] }],
    });

    // 3️⃣ Map attendance by user_id for quick lookup
    const recordMap = {};
    records.forEach((r) => (recordMap[r.user_id] = r));

    // 4️⃣ Build response list with all employees
    const list = users.map((user) => {
      const attendance = recordMap[user.user_id];
      let workHours = null;
      let extraHours = null;

      if (attendance?.check_in && attendance?.check_out) {
        const checkIn = new Date(`1970-01-01T${attendance.check_in}`);
        const checkOut = new Date(`1970-01-01T${attendance.check_out}`);
        const diff = (checkOut - checkIn) / (1000 * 60 * 60); // in hours
        workHours = diff.toFixed(2);
        extraHours = diff > 8 ? (diff - 8).toFixed(2) : "0.00";
      }

      return {
        user_id: user.user_id,
        name: user.name,
        role: user.role,
        status: attendance ? attendance.status : "Absent",
        check_in: attendance ? attendance.check_in : null,
        check_out: attendance ? attendance.check_out : null,
        work_hours: workHours,
        extra_hours: extraHours,
      };
    });

    // 5️⃣ Summary for top of page
    const summary = {
      totalEmployees: users.length,
      present: list.filter((e) => e.status === "Present").length,
      leave: list.filter((e) => e.status === "Leave").length,
      absent: list.filter((e) => e.status === "Absent").length,
    };

    // ✅ Send JSON response
    res.status(200).json({
      date: targetDate,
      summary,
      attendanceList: list,
    });
  } catch (error) {
    console.error("❌ getAdminAttendanceByDate Error:", error);
    res.status(500).json({ message: "Server error fetching attendance" });
  }
};
