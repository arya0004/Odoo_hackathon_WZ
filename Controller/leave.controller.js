// server/Controller/leave.controller.js
import { Leave, User } from "../config/db.js";
import { Op } from "sequelize";

// ✅ 1️⃣ Employee applies for leave (with optional attachment)
export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leave_type, time_off_type, start_date, end_date } = req.body;

    if (!leave_type || !start_date || !end_date || !time_off_type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const attachment = req.file ? `/uploads/leaves/${req.file.filename}` : null;

    const leave = await Leave.create({
      user_id: userId,
      leave_type,
      time_off_type,
      start_date,
      end_date,
      status: "Pending",
      attachment,
    });

    res.status(201).json({
      message: "✅ Leave applied successfully!",
      leave,
    });
  } catch (error) {
    console.error("❌ Apply Leave Error:", error);
    res.status(500).json({ message: "Server error while applying for leave" });
  }
};

// ✅ 2️⃣ Employee views their own leaves
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.params.id;

    const leaves = await Leave.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ leaves });
  } catch (error) {
    console.error("❌ Error fetching my leaves:", error);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// ✅ 3️⃣ Employee gets leave summary (Paid / Sick / Unpaid remaining)
export const getLeaveSummary = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: ["paid_leave_balance", "sick_leave_balance", "unpaid_leave_balance"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      summary: {
        PaidTimeOff: user.paid_leave_balance,
        SickTimeOff: user.sick_leave_balance,
        UnpaidTimeOff: user.unpaid_leave_balance,
      },
    });
  } catch (error) {
    console.error("❌ getLeaveSummary Error:", error);
    res.status(500).json({ message: "Error fetching leave summary" });
  }
};

// ✅ 4️⃣ HR/Admin view all leave requests
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: {
        model: User,
        attributes: ["name", "email", "role"],
      },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ leaves });
  } catch (error) {
    console.error("❌ Error fetching all leaves:", error);
    res.status(500).json({ message: "Error fetching all leaves" });
  }
};

// ✅ 5️⃣ HR/Admin approve or reject leave (auto-update balances)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Approved" or "Rejected"
    const leaveId = req.params.id;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const user = await User.findByPk(leave.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Calculate number of days
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // ✅ If admin approves, reduce from balance
    if (status === "Approved") {
      if (leave.time_off_type === "Paid Time Off" && user.paid_leave_balance >= totalDays) {
        user.paid_leave_balance -= totalDays;
      } else if (leave.time_off_type === "Sick Time Off" && user.sick_leave_balance >= totalDays) {
        user.sick_leave_balance -= totalDays;
      } else if (leave.time_off_type === "Unpaid Time Off") {
        user.unpaid_leave_balance += totalDays; // track unpaid usage
      } else {
        return res.status(400).json({
          message: "Insufficient leave balance for this approval",
        });
      }

      await user.save();
    }

    await leave.update({ status });

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully!`,
      updated_balances: {
        PaidTimeOff: user.paid_leave_balance,
        SickTimeOff: user.sick_leave_balance,
        UnpaidTimeOff: user.unpaid_leave_balance,
      },
    });
  } catch (error) {
    console.error("❌ Error updating leave status:", error);
    res.status(500).json({ message: "Server error while updating leave status" });
  }
};
