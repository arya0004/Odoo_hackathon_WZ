// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./config/db.js";
import userRoute from "./routes/user.routes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 4000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// ✅ Mount Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", userRoute);

try {
  await sequelize.authenticate();
  console.log("✅ MySQL connected successfully.");
  console.log("✅ Using existing tables (no schema sync).");
} catch (error) {
  console.error("❌ Database connection error:", error);
}


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 WorkZen HRMS backend connected successfully!");
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
