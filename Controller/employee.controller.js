// Controller/employee.controller.js
import { User, Company } from "../config/db.js";

// ✅ Get Employee Directory (read-only)
export const getEmployeeDirectory = async (req, res) => {
  try {
    const employees = await User.findAll({
      attributes: ["user_id", "name", "email", "role", "join_date"],
      include: {
        model: Company,
        attributes: ["company_name"],
      },
      order: [["name", "ASC"]],
    });

    res.status(200).json({ employees });
  } catch (error) {
    console.error("❌ Error fetching employee directory:", error);
    res.status(500).json({ message: "Server error while fetching directory" });
  }
};
