// // import bcrypt from "bcryptjs";
// // import crypto from "crypto";
// // import { User, Company, SalaryStructure } from "../config/db.js";
// // import transporter from "../config/nodemailer.js";
// // import { Op } from "sequelize";

// // Controller/admin.controller.js
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import { Op } from "sequelize";
// import { User, Company } from "../config/db.js";
// import transporter from "../config/nodemailer.js";

// /**
//  * Create first Admin + Company (with optional logo upload)
//  * POST /api/admin/signup
//  * body (multipart/form-data): name, email, phone, password, company_name, company_logo(file)
//  */
// export const adminSignup = async (req, res) => {
//   try {
//     const { name, email, phone, password, company_name } = req.body;

//     if (!name || !email || !password || !company_name) {
//       return res.status(400).json({ message: "name, email, password, company_name are required" });
//     }

//     // no duplicate email
//     const exists = await User.findOne({ where: { email } });
//     if (exists) return res.status(400).json({ message: "User already exists" });

//     // company: create or reuse
//     let company = await Company.findOne({ where: { company_name } });
//     const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

//     if (!company) {
//       company = await Company.create({
//         company_name,
//         company_logo: logoPath || null,
//       });
//     } else if (logoPath && !company.company_logo) {
//       // if company exists but has no logo, set it
//       await company.update({ company_logo: logoPath });
//     }

//     // Build login_id similar to your other flow
//     const compName = company.company_name || "XX";
//     const companyCode = compName.substring(0, 2).toUpperCase();

//     const [firstName = "", lastName = ""] = (name || "").trim().split(/\s+/, 2);
//     const nameCode =
//       (firstName.substring(0, 2) || "XX").toUpperCase() +
//       (lastName.substring(0, 2) || "YY").toUpperCase();

//     const year = new Date().getFullYear();
//     const yearUsers = await User.count({
//       where: {
//         join_date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
//       },
//     });
//     const serial = String(yearUsers + 1).padStart(4, "0");
//     const login_id = `${companyCode}${nameCode}${year}${serial}`;

//     const hashed = await bcrypt.hash(password, 10);

//     const adminUser = await User.create({
//       login_id,
//       name,
//       email,
//       phone,
//       password: hashed,
//       role: "Admin",
//       company_id: company.company_id,
//       is_first_login: true,
//     });

//     // (Optional) Send welcome e-mail
//     try {
//       await transporter.sendMail({
//         from: `"WorkZen HRMS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
//         to: email,
//         subject: "Welcome to WorkZen (Admin)",
//         html: `<p>Hi ${name},</p><p>Your company <b>${company.company_name}</b> is set up.</p><p>Login ID: <b>${login_id}</b></p>`,
//       });
//     } catch (e) {
//       console.warn("Email send failed (continuing):", e.message);
//     }

//     return res.status(201).json({
//       message: "Company created and Admin user registered",
//       company: { id: company.company_id, name: company.company_name, logo: company.company_logo },
//       admin: { id: adminUser.user_id, login_id, email: adminUser.email },
//     });
//   } catch (err) {
//     console.error("adminSignup error:", err);
//     res.status(500).json({ message: "Server error during admin signup", error: err.message });
//   }
// };


// export const adminCreateUser = async (req, res) => {
//   try {
//     // Admin guard
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Access denied: Only admins can create users" });
//     }

//     // company_name is OPTIONAL now
//     const { company_name, name, email, phone, role, monthly_wage, salary_structure_id } = req.body;

//     // Required fields (company_name NOT required)
//     if (!name || !email || !role) {
//       return res.status(400).json({ message: "Name, email and role are required" });
//     }

//     // No duplicate users
//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // ---- Resolve company --------------------------------------------
//     let company = null;

//     if (req.user.company_id) {
//       // Prefer admin's company
//       company = await Company.findByPk(req.user.company_id);
//       if (!company && company_name && company_name.trim()) {
//         // Admin has a stale/invalid company_id; fall back to provided name
//         company =
//           (await Company.findOne({ where: { company_name: company_name.trim() } })) ||
//           (await Company.create({ company_name: company_name.trim() }));
//         // Attach fixed company to admin for future calls
//         await User.update(
//           { company_id: company.company_id },
//           { where: { user_id: req.user.id } }
//         );
//       }
//     } else if (company_name && company_name.trim()) {
//       // Admin has no company; use provided name and ALSO attach it to admin
//       company =
//         (await Company.findOne({ where: { company_name: company_name.trim() } })) ||
//         (await Company.create({ company_name: company_name.trim() }));
//       await User.update(
//         { company_id: company.company_id },
//         { where: { user_id: req.user.id } }
//       );
//     }

//     if (!company) {
//       // Still nothing resolved: ask the client to send a company_name once
//       return res.status(400).json({
//         message:
//           "Admin has no company associated. Please provide 'company_name' once so it can be set and used for future users.",
//       });
//     }
//     // ------------------------------------------------------------------

//     // Build login_id (same as your logic, with safe fallbacks)
//     const compName = company.company_name || "XX";
//     const companyCode = compName.substring(0, 2).toUpperCase();

//     const [firstName = "", lastName = ""] = (name || "").trim().split(/\s+/, 2);
//     const nameCode =
//       (firstName.substring(0, 2) || "XX").toUpperCase() +
//       (lastName.substring(0, 2) || "YY").toUpperCase();

//     const year = new Date().getFullYear();
//     const yearUsers = await User.count({
//       where: {
//         join_date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
//       },
//     });
//     const serial = String(yearUsers + 1).padStart(4, "0");
//     const login_id = `${companyCode}${nameCode}${year}${serial}`;

//     // Temp password + hash
//     const plainPassword = crypto.randomBytes(4).toString("hex");
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     // pick salary structure
//     let structureId = null;
//     if (salary_structure_id) {
//       const st = await SalaryStructure.findOne({
//         where: { salary_structure_id, company_id: company.company_id },
//       });
//       if (!st) return res.status(400).json({ message: "Invalid salary_structure_id for this company" });
//       structureId = st.salary_structure_id;
//     } else {
//       const st = await SalaryStructure.findOne({
//         where: { company_id: company.company_id },
//         order: [["salary_structure_id", "ASC"]],
//       });
//       structureId = st ? st.salary_structure_id : null; // ok if null; payroll compute will error if not set
//     }

//     // Create new user under resolved company
//     const newUser = await User.create({
//       login_id,
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       role,
//       company_id: company.company_id,
//     });

//     // Send credentials email (fallback if SENDER_EMAIL not set)
//     const mailOptions = {
//       from: `"WorkZen HRMS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Your WorkZen Account Credentials",
//       html: `
//         <h2>Welcome to WorkZen!</h2>
//         <p>Dear ${name},</p>
//         <p>Your WorkZen HRMS account has been created by the administrator.</p>
//         <p><b>Login ID:</b> ${login_id}</p>
//         <p><b>Temporary Password:</b> ${plainPassword}</p>
//         <p>Please log in and change your password after your first login.</p>
//         <br/>
//         <p>Best regards,<br/>WorkZen HRMS Team</p>
//       `,
//     };
//     await transporter.sendMail(mailOptions);

//     return res.status(201).json({
//       message: "✅ User created successfully and credentials sent via email",
//       user: { id: newUser.user_id, name: newUser.name, login_id },
//     });
//   } catch (error) {
//     console.error("❌ adminCreateUser Error:", error);
//     return res.status(500).json({
//       message: "Server error creating user",
//       error: error.message,
//     });
//   }
// };

// export const getEmployeeFullProfile = async (req, res) => {
//   try {
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Access denied: Admins only" });
//     }

//     const { user_id } = req.params;

//     const employee = await User.findByPk(user_id, {
//       include: [{ model: Company, attributes: ["company_name"] }],
//     });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.status(200).json({ profile: employee });
//   } catch (error) {
//     console.error("❌ Error fetching full profile:", error);
//     res.status(500).json({ message: "Server error fetching profile" });
//   }
// };

// export const updateEmployeeFullProfile = async (req, res) => {
//   try {
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Access denied: Admins only" });
//     }

//     const { user_id } = req.params;
//     const employee = await User.findByPk(user_id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Prevent updating restricted fields
//     const { login_id, email, company_id, role, manager_id, ...allowedUpdates } = req.body;

//     await employee.update(allowedUpdates);
//     res.status(200).json({ message: "✅ Employee profile updated successfully" });
//   } catch (error) {
//     console.error("❌ Error updating profile:", error);
//     res.status(500).json({ message: "Server error updating profile" });
//   }
// };

// // export const adminSignup = async (req, res) => {
// //   try {
// //     const { name, email, password, company_name, phone } = req.body;
// //     const logo = req.file ? `/uploads/company_logos/${req.file.filename}` : null;
// // console.log("🧾 req.body:", req.body);
// // console.log("🖼 req.file:", req.file);
// //     const company = await Company.create({
// //       company_name,
// //       company_logo: logo,
// //     });

// //     const admin = await User.create({
// //       name,
// //       email,
// //       password,
// //       phone,
// //       role: "Admin",
// //       company_id: company.company_id,
// //     });

// //     res.status(201).json({
// //       message: "✅ Admin registered successfully",
// //       admin,
// //       company,
// //     });
// //   } catch (error) {
// //     console.error("❌ Error in adminSignup:", error);
// //     res.status(500).json({ message: "Server error during admin signup" });
// //   }
// // };


// Controller/admin.controller.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { User, Company } from "../config/db.js";
import transporter from "../config/nodemailer.js";

/* -------------------------------------------
   1) Admin signup + company (with logo upload)
   POST /api/admin/signup  (multipart/form-data)
   fields: name, email, phone, password, company_name, company_logo(file)
-------------------------------------------- */
export const adminSignup = async (req, res) => {
  try {
    const { name, email, phone, password, company_name } = req.body;
    if (!name || !email || !password || !company_name) {
      return res.status(400).json({ message: "name, email, password, company_name are required" });
    }

    const dup = await User.findOne({ where: { email } });
    if (dup) return res.status(400).json({ message: "User already exists" });

    // create or find company
    let company = await Company.findOne({ where: { company_name } });
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!company) {
      company = await Company.create({
        company_name,
        company_logo: logoPath || null,
      });
    } else if (logoPath && !company.company_logo) {
      await company.update({ company_logo: logoPath });
    }

    // login_id builder
    const compName = company.company_name || "XX";
    const companyCode = compName.substring(0, 2).toUpperCase();
    const [firstName = "", lastName = ""] = (name || "").trim().split(/\s+/, 2);
    const nameCode =
      (firstName.substring(0, 2) || "XX").toUpperCase() +
      (lastName.substring(0, 2) || "YY").toUpperCase();
    const year = new Date().getFullYear();
    const yearUsers = await User.count({
      where: { join_date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
    });
    const serial = String(yearUsers + 1).padStart(4, "0");
    const login_id = `${companyCode}${nameCode}${year}${serial}`;

    const hashed = await bcrypt.hash(password, 10);
    const adminUser = await User.create({
      login_id,
      name,
      email,
      phone,
      password: hashed,
      role: "Admin",
      company_id: company.company_id,
      is_first_login: true,
    });

    // best-effort email
    try {
      await transporter.sendMail({
        from: `"WorkZen HRMS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to WorkZen (Admin created)",
        html: `<p>Hi ${name},</p><p>Your company <b>${company.company_name}</b> is set up.</p><p>Login ID: <b>${login_id}</b></p>`,
      });
    } catch (e) { console.warn("Email send failed:", e.message); }

    return res.status(201).json({
      message: "Company created and Admin user registered",
      company: { id: company.company_id, name: company.company_name, logo: company.company_logo },
      admin: { id: adminUser.user_id, login_id, email: adminUser.email },
    });
  } catch (err) {
    console.error("adminSignup error:", err);
    res.status(500).json({ message: "Server error during admin signup", error: err.message });
  }
};

/* -------------------------------------------
   2) Create user (Admin only)
-------------------------------------------- */
export const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Only admins can create users" });
    }

    const { company_name, name, email, phone, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, email and role are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // resolve company
    let company = null;
    if (req.user.company_id) {
      company = await Company.findByPk(req.user.company_id);
    }
    if (!company && company_name) {
      company =
        (await Company.findOne({ where: { company_name: company_name.trim() } })) ||
        (await Company.create({ company_name: company_name.trim() }));
    }
    if (!company) {
      return res.status(400).json({
        message: "Admin has no company associated. Please provide 'company_name' once.",
      });
    }

    const compName = company.company_name || "XX";
    const companyCode = compName.substring(0, 2).toUpperCase();
    const [firstName = "", lastName = ""] = (name || "").trim().split(/\s+/, 2);
    const nameCode =
      (firstName.substring(0, 2) || "XX").toUpperCase() +
      (lastName.substring(0, 2) || "YY").toUpperCase();
    const year = new Date().getFullYear();
    const yearUsers = await User.count({
      where: { join_date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
    });
    const serial = String(yearUsers + 1).padStart(4, "0");
    const login_id = `${companyCode}${nameCode}${year}${serial}`;

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      login_id,
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      company_id: company.company_id,
    });

    try {
      await transporter.sendMail({
        from: `"WorkZen HRMS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: "Your WorkZen Account Credentials",
        html: `<p>Login ID: <b>${login_id}</b><br/>Temp Password: <b>${tempPassword}</b></p>`,
      });
    } catch (e) { console.warn("Email send failed:", e.message); }

    return res.status(201).json({
      message: "User created and credentials sent",
      user: { id: newUser.user_id, name: newUser.name, login_id },
    });
  } catch (error) {
    console.error("adminCreateUser error:", error);
    res.status(500).json({ message: "Server error creating user", error: error.message });
  }
};

/* -------------------------------------------
   3) Admin get full profile
-------------------------------------------- */
export const getEmployeeFullProfile = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const { user_id } = req.params;
    const employee = await User.findByPk(user_id, {
      include: [{ model: Company, attributes: ["company_name", "company_logo"] }],
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ profile: employee });
  } catch (error) {
    console.error("getEmployeeFullProfile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

/* -------------------------------------------
   4) Admin update full profile
-------------------------------------------- */
export const updateEmployeeFullProfile = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const { user_id } = req.params;
    const employee = await User.findByPk(user_id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const { login_id, email, company_id, role, manager_id, ...allowed } = req.body;
    await employee.update(allowed);
    res.status(200).json({ message: "Employee profile updated" });
  } catch (error) {
    console.error("updateEmployeeFullProfile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
