import { Leave, User } from "../config/db.js";

// ✅ Employee applies for leave
export const applyLeave = async (req, res) => {
  try {
    console.log("🟢 req.user:", req.user);
    const userId = req.user?.id;
    const { leave_type, start_date, end_date } = req.body;

    console.log("🟢 Request Body:", { userId, leave_type, start_date, end_date });

    if (!userId || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const leave = await Leave.create({
      user_id: userId,
      leave_type,
      start_date,
      end_date,
      status: "Pending",
    });

    res.status(201).json({ message: "✅ Leave applied successfully", leave });
  } catch (error) {
    console.error("❌ Apply Leave Error:", error);
    res.status(500).json({ message: "Server error while applying for leave", error: error.message });
  }
};

// ✅ Employee views their own leaves
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.params.id;
    const leaves = await Leave.findAll({ where: { user_id: userId } });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// ✅ HR/Admin view all leaves
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: { model: User, attributes: ["name", "email", "role"] },
    });
    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all leaves" });
  }
};

// ✅ HR/Admin approve or reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Approved" or "Rejected"
    const leaveId = req.params.id;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    await leave.update({ status });
    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave status" });
  }
};
