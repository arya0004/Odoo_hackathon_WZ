// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./config/db.js";
import userRoute from "./routes/user.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/uploads", express.static("uploads"));


// ✅ Database Connection and Sync
try {
  await sequelize.authenticate();
  console.log("✅ MySQL connected successfully.");

  // ✅ Synchronize all models safely (NO drop, just adjust schema)
  await sequelize.sync({ alter: true });

  console.log("✅ All tables are up-to-date.");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

// ✅ Mount Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", userRoute);
import leaveRoutes from "./routes/leave.routes.js";
app.use("/api/leave", leaveRoutes);
import employeeRoutes from "./routes/employee.routes.js";
app.use("/api/employee", employeeRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 WorkZen HRMS backend connected successfully!");
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
