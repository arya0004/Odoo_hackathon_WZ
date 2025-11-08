import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, Company } from "../config/db.js";
import transporter from "../config/nodemailer.js";
import { Op } from "sequelize";

export const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Only admins can create users" });
    }

    const { company_name, name, email, phone, role } = req.body;
    if (!company_name || !name || !email || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    let company = await Company.findOne({ where: { company_name } });
    if (!company) company = await Company.create({ company_name });

    const companyCode = company_name.substring(0, 2).toUpperCase();
    const [firstName, lastName] = name.split(" ");
    const nameCode =
      (firstName?.substring(0, 2) || "XX").toUpperCase() +
      (lastName?.substring(0, 2) || "YY").toUpperCase();
    const year = new Date().getFullYear();

    const yearUsers = await User.count({
      where: {
        join_date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
      },
    });

    const serial = String(yearUsers + 1).padStart(4, "0");
    const login_id = `${companyCode}${nameCode}${year}${serial}`;

    const plainPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      login_id,
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      company_id: company.company_id,
    });

    const mailOptions = {
      from: `"WorkZen HRMS" <${process.env.SENDER_EMAIL}>`, // ✅ Fix
      to: email,
      subject: "Your WorkZen Account Credentials",
      html: `
        <h2>Welcome to WorkZen!</h2>
        <p>Dear ${name},</p>
        <p>Your WorkZen HRMS account has been created by the administrator.</p>
        <p><b>Login ID:</b> ${login_id}</p>
        <p><b>Temporary Password:</b> ${plainPassword}</p>
        <p>Please log in and change your password after your first login.</p>
        <br/>
        <p>Best regards,<br>WorkZen HRMS Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "✅ User created successfully and credentials sent via email",
      user: { id: newUser.user_id, name: newUser.name, login_id },
    });
  } catch (error) {
    console.error("❌ adminCreateUser Error:", error);
    res.status(500).json({
      message: "Server error creating user",
      error: error.message,
    });
  }
};


export const getEmployeeFullProfile = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { user_id } = req.params;

    const employee = await User.findByPk(user_id, {
      include: [{ model: Company, attributes: ["company_name"] }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ profile: employee });
  } catch (error) {
    console.error("❌ Error fetching full profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const updateEmployeeFullProfile = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { user_id } = req.params;
    const employee = await User.findByPk(user_id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prevent updating restricted fields
    const { login_id, email, company_id, role, manager_id, ...allowedUpdates } = req.body;

    await employee.update(allowedUpdates);
    res.status(200).json({ message: "✅ Employee profile updated successfully" });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
