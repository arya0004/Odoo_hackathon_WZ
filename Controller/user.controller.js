// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

// // =====================================
// // ✅ REGISTER USER
// // =====================================
// export const registerUser = async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !password || !email) {
//     return res.status(400).json({
//       message: "Please fill in all fields",
//       success: false,
//     });
//   }

//   try {
//     const existingUser = await User.findOne({ where: { email } });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists",
//         success: false,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     };

//     res.cookie("token", token, cookieOptions);

//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: email,
//       subject: "Welcome to Our Company 🎉",
//       html: `
//         <h2>Welcome, ${name}!</h2>
//         <p>Thanks for signing up with us. We’re excited to have you on board!</p>
//         <br>
//         <p>— The Team</p>
//       `,
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log("✅ Email sent successfully");
//     } catch (emailError) {
//       console.error("❌ Email failed:", emailError.message);
//     }

//     return res.status(201).json({
//       message: "Registered successfully",
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.error("❌ Registration Error:", error.message);
//     return res.status(500).json({
//       message: "Registration failed",
//       success: false,
//     });
//   }
// };

// // =====================================
// // ✅ LOGIN USER
// // =====================================
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       message: "Please fill in all fields",
//       success: false,
//     });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid credentials",
//         success: false,
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid password",
//         success: false,
//       });
//     }

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     };

//     res.cookie("token", token, cookieOptions);

//     return res.json({
//       message: "Logged in successfully",
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Login Error:", error);
//     return res
//       .status(500)
//       .json({ message: "Failed to login", success: false });
//   }
// };

// // =====================================
// // ✅ LOGOUT USER
// // =====================================
// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//     });

//     return res.json({
//       message: "Logged out successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res
//       .status(400)
//       .json({ message: "Failed to logout", success: false });
//   }
// };

// // =====================================
// // ✅ SEND VERIFICATION OTP
// // =====================================
// export const sendVerificationOTP = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.isVerified) {
//       return res.json({ success: false, message: "Already verified" });
//     }

//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     user.verificationToken = otp;
//     user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
//     await user.save();

//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Account verification OTP",
//       text: `Your OTP is ${otp}. Verify your account using this OTP.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: "Verification OTP sent", success: true });
//   } catch (error) {
//     res.json({ message: error.message, success: false });
//   }
// };

// // =====================================
// // ✅ VERIFY USER
// // =====================================
// export const verifyUser = async (req, res) => {
//   const { otp } = req.body;
//   const userId = req.user.id;

//   if (!userId || !otp) {
//     return res.json({ success: false, message: "Missing fields" });
//   }

//   try {
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return res.json({ message: "User not found", success: false });
//     }

//     if (user.verificationToken !== otp) {
//       return res.json({ message: "Invalid OTP", success: false });
//     }

//     if (user.verificationTokenExpiry < Date.now()) {
//       return res.json({ message: "OTP expired", success: false });
//     }

//     user.isVerified = true;
//     user.verificationToken = "";
//     user.verificationTokenExpiry = 0;
//     await user.save();

//     return res.json({
//       success: true,
//       message: "Email verified successfully",
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: "Verification failed",
//     });
//   }
// };

// // =====================================
// // ✅ SEND RESET OTP
// // =====================================
// export const sendResetOTP = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.json({
//       success: false,
//       message: "Email is required",
//     });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     user.resetOtp = otp;
//     user.resetOtpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
//     await user.save();

//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Password Reset OTP",
//       text: `Your OTP is ${otp}. Use it to reset your password.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({
//       message: "Password reset OTP sent to email",
//       success: true,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =====================================
// // ✅ RESET PASSWORD
// // =====================================
// export const resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   if (!email || !otp || !newPassword) {
//     return res.json({
//       success: false,
//       message: "Email, OTP, and new password are required",
//     });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.resetOtp === "" || user.resetOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpiry < Date.now()) {
//       return res.json({ success: false, message: "OTP expired" });
//     }

//     const hashedPass = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPass;
//     user.resetOtp = "";
//     user.resetOtpExpiry = 0;
//     await user.save();

//     return res.json({
//       message: "Password has been successfully reset",
//       success: true,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =====================================
// // ✅ CHECK AUTHENTICATION
// // =====================================
// export const isAuthenticated = async (req, res) => {
//   try {
//     return res.json({ success: true });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };



// server/Controller/user.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User, Company } from "../config/db.js";
dotenv.config();

// ✅ Register User (Admin/HR can create new users)
export const registerUser = async (req, res) => {
  try {
    const { company_name, name, email, phone, password, role } = req.body;

    // 1️⃣ Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Create or find company
    let company = await Company.findOne({ where: { company_name } });
    if (!company) {
      company = await Company.create({ company_name });
    }

    // 3️⃣ Generate login_id → OIJD20250001 (example)
    const companyCode = company_name.substring(0, 2).toUpperCase();
    const nameCode = (name.split(" ")[0][0] + name.split(" ")[1]?.[0] || "X").toUpperCase();
    const year = new Date().getFullYear();
    const userCount = await User.count();
    const serial = String(userCount + 1).padStart(4, "0");
    const login_id = `${companyCode}${nameCode}${year}${serial}`;

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const newUser = await User.create({
      login_id,
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "Employee",
      company_id: company.company_id,
    });

    res.status(201).json({
      message: "✅ User registered successfully",
      login_id,
      user: { id: newUser.user_id, name: newUser.name, role: newUser.role },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "✅ Login successful",
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ Logout User
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "✅ Logged out successfully" });
};

// ✅ Middleware Authentication
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ authenticated: true, user });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: ["user_id", "login_id", "name", "email", "phone", "role", "join_date"],
      include: {
        model: Company,
        attributes: ["company_name", "company_logo"]
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("❌ Profile Error:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

