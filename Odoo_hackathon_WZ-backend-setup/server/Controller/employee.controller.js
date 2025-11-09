// // Controller/employee.controller.js
// import { User, Company } from "../config/db.js";


// // ✅ Get Employee Directory (Admin’s company only)
// export const getEmployeeDirectory = async (req, res) => {
//   try {
//     // Ensure only Admins can view the directory
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Access denied: Admins only" });
//     }

//     // Fetch employees belonging to the same company as the logged-in admin
//     const employees = await User.findAll({
//       where: { company_id: req.user.company_id }, // ✅ Filter by admin’s company
//       attributes: ["user_id", "name", "email", "role", "join_date"],
//       include: {
//         model: Company,
//         attributes: ["company_name"],
//       },
//       order: [["name", "ASC"]],
//     });

//     res.status(200).json({ employees });
//   } catch (error) {
//     console.error("❌ Error fetching employee directory:", error);
//     res.status(500).json({ message: "Server error while fetching directory" });
//   }
// };


// export const getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // logged-in user

//     const employee = await User.findByPk(userId, {
//       attributes: [
//         "user_id",
//         "name",
//         "email",
//         "phone",
//         "role",
//         "job_position",
//         "department",
//         "location",
//         "date_of_birth",
//         "address",
//         "nationality",
//         "personal_email",
//         "gender",
//         "marital_status",
//         "date_of_joining",
//         "account_number",
//         "bank_name",
//         "ifsc_code",
//         "pan_no",
//         "uan_no",
//         "emp_code"
//       ],
//       include: [
//         {
//           model: Company,
//           attributes: ["company_name"],
//         },
//         {
//           model: User,
//           as: "Manager",
//           attributes: ["name", "email"],
//         },
//       ],
//     });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.status(200).json({
//       message: "Profile fetched successfully",
//       profile: employee,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching profile:", error);
//     res.status(500).json({ message: "Server error while fetching profile" });
//   }
// };
// export const updateMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const employee = await User.findByPk(userId);

//     if (!employee) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ❌ Restricted fields — cannot be updated by employee
//     const restrictedFields = [
//       "role",
//       "company_id",
//       "manager_id",
//       "department",
//       "job_position",
//       "location",
//     ];

//     // ✅ Allow only editable fields
//     const updateData = { ...req.body };
//     restrictedFields.forEach(field => delete updateData[field]);

//     await employee.update(updateData);

//     res.status(200).json({
//       message: "✅ Profile updated successfully",
//       updatedProfile: employee,
//     });
//   } catch (error) {
//     console.error("❌ Error updating profile:", error);
//     res.status(500).json({ message: "Server error while updating profile" });
//   }
// };
// import bcrypt from "bcryptjs";


// export const changePassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     const userId = req.user.id;

//     // Fetch the user
//     const user = await User.findByPk(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Compare old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     // Hash and update new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await user.update({ password: hashedPassword, must_change_password: false });

//     return res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("❌ Password update error:", error);
//     res.status(500).json({ message: "Server error updating password" });
//   }
// };



// export const uploadResume = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const resumePath = `/uploads/resumes/${req.file.filename}`;
//     await User.update({ resume_path: resumePath }, { where: { user_id: userId } });

//     res.status(200).json({
//       message: "Resume uploaded successfully",
//       resume_url: resumePath,
//     });
//   } catch (error) {
//     console.error("❌ Resume upload error:", error);
//     res.status(500).json({ message: "Error uploading resume" });
//   }
// };

// Controller/employee.controller.js
import { User, Company } from "../config/db.js";
import bcrypt from "bcryptjs";

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */
const isStaff = (role) => ["Admin", "HR", "Payroll"].includes(String(role || "").trim());
const anyAllowed = (role) => ["Admin", "HR", "Payroll", "Employee"].includes(String(role || "").trim());
const getReqUserId = (req) => req?.user?.user_id ?? req?.user?.id;

/* =============================================================
   GET /employee/directory  (scoped to a single company)
   - Router middleware sets req.query.companyId safely.
   - Employees: only their own company.
   - Staff: can pass ?companyId=..., else defaults to own.
============================================================= */
export const getEmployeeDirectory = async (req, res) => {
  try {
    const role = req.user?.role;
    if (!anyAllowed(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // companyId is injected in routes by scopeDirectoryToCompany
    const companyId = Number(req.query.companyId ?? req.user?.company_id);
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // (Optional) If you want only 'Employee' cards listed on dashboard:
    // const roleFilter = { role: "Employee" };
    // else return all roles from that company:
    const where = { company_id: companyId /*, ...roleFilter */ };

    const employees = await User.findAll({
      where,
      attributes: [
        "user_id",
        "name",
        "email",
        "role",
        "join_date",
        "company_id",            // <- include raw company_id for the frontend
      ],
      include: [
        {
          model: Company,
          attributes: ["company_id", "company_name", "company_logo"], // <- also include nested id & logo
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ employees });
  } catch (error) {
    console.error("❌ Error fetching employee directory:", error);
    return res.status(500).json({ message: "Server error while fetching directory" });
  }
};

/* =============================================================
   GET /employee/myprofile
============================================================= */
export const getMyProfile = async (req, res) => {
  try {
    const userId = getReqUserId(req); // supports req.user.user_id or req.user.id
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const employee = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "login_id",
        "name",
        "email",
        "phone",
        "role",
        "job_position",
        "department",
        "location",
        "date_of_birth",
        "address",
        "nationality",
        "personal_email",
        "gender",
        "marital_status",
        "date_of_joining",
        "join_date",
        "account_number",
        "bank_name",
        "ifsc_code",
        "pan_no",
        "uan_no",
        "emp_code",
        "resume_path",
        "company_id",
      ],
      include: [
        {
          model: Company,
          attributes: ["company_id", "company_name", "company_logo"],
        },
        {
          model: User,
          as: "Manager",
          attributes: ["name", "email"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      profile: employee,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
};

/* =============================================================
   PUT /employee/my-profile
   (Employee can only update non-restricted fields)
============================================================= */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const employee = await User.findByPk(userId);
    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Restricted fields — cannot be updated by employee
    const restrictedFields = [
      "role",
      "company_id",
      "manager_id",
      "department",
      "job_position",
      "location",
      "user_id",
      "login_id",
      "password",
    ];

    // ✅ Allow only editable fields
    const updateData = { ...(req.body || {}) };
    restrictedFields.forEach((f) => delete updateData[f]);

    await employee.update(updateData);

    return res.status(200).json({
      message: "✅ Profile updated successfully",
      updatedProfile: employee,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return res.status(500).json({ message: "Server error while updating profile" });
  }
};

/* =============================================================
   PUT /employee/change-password
============================================================= */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword || "", user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword || ""), 10);
    await user.update({ password: hashedPassword, must_change_password: false });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Password update error:", error);
    return res.status(500).json({ message: "Server error updating password" });
  }
};

/* =============================================================
   POST /employee/upload-resume
============================================================= */
export const uploadResume = async (req, res) => {
  try {
    const userId = getReqUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumePath = `/uploads/resumes/${req.file.filename}`;
    await User.update({ resume_path: resumePath }, { where: { user_id: userId } });

    return res.status(200).json({
      message: "Resume uploaded successfully",
      resume_url: resumePath,
    });
  } catch (error) {
    console.error("❌ Resume upload error:", error);
    return res.status(500).json({ message: "Error uploading resume" });
  }
};
