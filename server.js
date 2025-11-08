// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize, Company, User, Attendance, Leave, Payroll } from "./config/db.js";
import userRoute from "./routes/user.routes.js"; // ✅ Import your route file

dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 4000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// ✅ Database Connection
try {
  await sequelize.authenticate();
  console.log("✅ MySQL connected successfully.");

  // ✅ Force recreate tables in correct order ONCE
  await Company.sync({ force: true });
  await User.sync({ force: true });
  await Attendance.sync({ force: true });
  await Leave.sync({ force: true });
  await Payroll.sync({ force: true });

  console.log("✅ All tables created successfully.");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

// ✅ Mount Routes
app.use("/api/auth", userRoute); // 💥 This line is required for /api/auth/register etc.

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 WorkZen HRMS backend connected successfully!");
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
