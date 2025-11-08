import { User } from "../config/db.js";

// ✅ 1️⃣ Fetch all employees of the admin's company
export const getCompanyUsers = async (req, res) => {
  try {
    // Allow only admins
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Fetch employees under the same company
    const employees = await User.findAll({
      where: { company_id: req.user.company_id },
      attributes: ["user_id", "name", "email", "login_id", "role"],
      order: [["user_id", "ASC"]],
    });

    res.status(200).json({ employees });
  } catch (error) {
    console.error("❌ getCompanyUsers Error:", error);
    res.status(500).json({ message: "Server error fetching employees" });
  }
};

// ✅ 2️⃣ Update role for a specific user
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { user_id } = req.params;
    const { newRole } = req.body;

    // Validate role input
    const validRoles = ["Admin", "HR", "Payroll", "Employee"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    // Update user role only if in same company
    const [updated] = await User.update(
      { role: newRole },
      {
        where: {
          user_id,
          company_id: req.user.company_id,
        },
      }
    );

    if (updated === 0) {
      return res.status(404).json({
        message: "User not found or not part of your company",
      });
    }

    res.status(200).json({ message: "✅ User role updated successfully" });
  } catch (error) {
    console.error("❌ updateUserRole Error:", error);
    res.status(500).json({ message: "Server error updating user role" });
  }
};


// ✅ Get salary info for specific employee
export const getEmployeeSalaryInfo = async (req, res) => {
  try {
    if (!["Admin", "Payroll"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { user_id } = req.params;
    const employee = await User.findByPk(user_id, {
      attributes: [
        "user_id", "name", "email", "role",
        "monthly_wage", "basic_salary", "hra", "standard_allowance",
        "performance_bonus", "leave_travel_allowance", "fixed_allowance",
        "pf_rate", "professional_tax", "working_days_per_week", "break_time_hours"
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ salaryInfo: employee });
  } catch (error) {
    console.error("❌ Error fetching salary info:", error);
    res.status(500).json({ message: "Server error fetching salary info" });
  }
};

// ✅ Update salary info
export const updateEmployeeSalaryInfo = async (req, res) => {
  try {
    if (!["Admin", "Payroll"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { user_id } = req.params;
    const employee = await User.findByPk(user_id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update(req.body);
    res.status(200).json({ message: "✅ Salary information updated successfully" });
  } catch (error) {
    console.error("❌ Error updating salary info:", error);
    res.status(500).json({ message: "Server error updating salary info" });
  }
};
