// Controller/employee.controller.js
import { User, Company } from "../config/db.js";

// ✅ Get Employee Directory (Admin’s company only)
export const getEmployeeDirectory = async (req, res) => {
  try {
    // Ensure only Admins can view the directory
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Fetch employees belonging to the same company as the logged-in admin
    const employees = await User.findAll({
      where: { company_id: req.user.company_id }, // ✅ Filter by admin’s company
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
