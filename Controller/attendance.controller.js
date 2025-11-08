// server/Controller/attendance.controller.js
import { Attendance } from "../config/db.js";
import { Sequelize } from "sequelize";

// Utility to get today's date (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split("T")[0];

// ✅ Check-In
export const checkIn = async (req, res) => {
  try {
    // NOTE: use req.user.user_id (must match what you put in the JWT)
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized: invalid token" });

    const today = getTodayDate();

    // Prevent duplicate check-ins for the same day
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
    const userId = req.user?.user_id;
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
