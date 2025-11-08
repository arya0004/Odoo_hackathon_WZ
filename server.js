// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./config/db.js";
import cron from "node-cron";
import { cleanupInactiveUsers } from "./utils/cleanupInactiveUsers.js";

import userRoute from "./routes/user.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminSettingsRoute from "./routes/adminSettings.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

// ✅ Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use("/uploads", express.static("uploads"));

// ✅ Database Connection and Sync
try {
  await sequelize.authenticate();
  console.log("✅ MySQL connected successfully.");

  await sequelize.sync({ alter: true });
  console.log("✅ All tables are up-to-date.");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

// ✅ Mount Routes
app.use("/api/auth", userRoute);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminSettingsRoute);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 WorkZen HRMS backend connected successfully!");
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);

  // 🧪 Run once immediately (for testing)
  cleanupInactiveUsers();

  // 🕛 Schedule cleanup job (runs every 1 min for testing)
  cron.schedule("0 0 * * *", () => {
    console.log("🕛 Running cleanup job...");
    cleanupInactiveUsers();
  });
});
