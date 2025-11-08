import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// ✅ Change these if needed
const sequelize = new Sequelize("workzen_hrms", "root", process.env.DB_PASS, {
  host: "localhost",
  dialect: "mysql",
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
