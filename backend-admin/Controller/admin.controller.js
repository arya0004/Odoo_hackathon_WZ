import { Op } from "sequelize";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";
import { User, Leave, Payroll, Attendance, Company} from "../config/db.js";

/**
 * GET /api/admin/stats
 * Returns JSON:
 * {
 *   totalEmployees: number,
 *   pendingLeaves: number,
 *   payrollProcessed: number,
 *   attendanceRate: number  // percentage rounded to 2 decimals
 * }
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalEmployees = await User.count({ where: { role: "Employee" } });
    const pendingLeaves = await Leave.count({ where: { status: "Pending" } });
    const payrollProcessed = await Payroll.count({ where: { payrun_date: { [Op.ne]: null } } });
    const totalAttendance = await Attendance.count();
    const presentCount = await Attendance.count({ where: { status: "Present" } });

    const attendanceRate =
      totalAttendance === 0 ? 0 : Number(((presentCount / totalAttendance) * 100).toFixed(2));

    res.json({
      totalEmployees,
      pendingLeaves,
      payrollProcessed,
      attendanceRate,
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    res.status(500).json({ message: "Error fetching admin stats" });
  }
};

/**
 * GET /api/admin/users
 * Optional query params: ?page=1&pageSize=20&search=term&role=Employee
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const pageSize = Math.max(parseInt(req.query.pageSize || "50"), 1);
    const offset = (page - 1) * pageSize;
    const { search, role } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { login_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: [
        "user_id",
        "login_id",
        "name",
        "email",
        "phone",
        "role",
        "company_id",
        "join_date",
        "createdAt",
        "updatedAt",
      ],
      order: [["user_id", "DESC"]],
      limit: pageSize,
      offset,
    });

    res.json({
      data: rows,
      meta: { total: count, page, pageSize },
    });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      attributes: ["user_id", "login_id", "name", "email", "phone", "role", "company_id", "join_date", "createdAt", "updatedAt"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};
/**
 * POST /api/admin/users
 * Body: { company_name OR company_id, name, email, phone, password, role }
 */

// ✅ Create new user (Admin-only)
function generateTempPassword(len = 12) {
  return crypto.randomBytes(Math.ceil(len/2)).toString("hex").slice(0, len);
}

export const createUser = async (req, res) => {
  try {
    const { company_name, name, email, phone, role, password } = req.body;

    if (!company_name || !name || !email) {
      return res.status(400).json({ message: "company_name, name and email required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // find/create company
    let company = await Company.findOne({ where: { company_name } });
    if (!company) company = await Company.create({ company_name });

    // generate login id (your logic)
    const companyCode = company_name.substring(0, 2).toUpperCase();
    const nameParts = name.split(" ");
    const nameCode = (nameParts[0][0] + (nameParts[1]?.[0] || "X")).toUpperCase();
    const year = new Date().getFullYear();
    const userCount = await User.count();
    const serial = String(userCount + 1).padStart(4, "0");
    const login_id = `${companyCode}${nameCode}${year}${serial}`;

    // use provided password or generate
    const plainPassword = password || generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      login_id,
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "Employee",
      company_id: company.company_id,
      must_change_password: password ? false : true // require change if temp generated
    });

    // respond immediately (non-blocking send)
    res.status(201).json({
      message: "User created successfully. Onboarding email will be sent shortly.",
      user: { user_id: newUser.user_id, login_id, email, name: newUser.name, role: newUser.role }
    });

    // prepare email content
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to WorkZen HRMS — your login details",
      html: `
        <h3>Hello ${name},</h3>
        <p>Your account has been created. Use the credentials below to log in:</p>
        <ul>
          <li><b>Login ID:</b> ${login_id}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Password:</b> ${plainPassword}</li>
        </ul>
        <p><b>Important:</b> Please change your password after first login.</p>
        <br/>
        <p>— WorkZen HRMS</p>
      `
    };

    // send email asynchronously
    transporter.sendMail(mailOptions)
      .then(info => console.log(`Email sent (onboarding) to ${email}: ${info.messageId}`))
      .catch(err => {
        console.error("Failed to send onboarding email:", err);
        // Optionally: persist failure in DB for retry
      });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};


/**
 * PUT /api/admin/users/:id
 * Body may contain: name, email, phone, role, company_id, password
 */
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone, role, company_id, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // if email changed, ensure uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    // optional: validate role allowed values
    const allowedRoles = ["Admin", "HR", "Payroll", "Employee"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    // company check if provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) return res.status(400).json({ message: "Provided company_id not found" });
    }

    // update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (company_id !== undefined) user.company_id = company_id;

    // update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        user_id: user.user_id,
        login_id: user.login_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await User.destroy({ where: { user_id: id } });
    if (!deleted) return res.status(404).json({ message: "User not found or already deleted" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};