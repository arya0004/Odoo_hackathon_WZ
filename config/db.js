// config/db.js
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// ✅ Safe Sequelize configuration
const sequelize = new Sequelize("workzen_hrms_new", "root", process.env.DB_PASS, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
  define: {
    freezeTableName: true, // ❗ Prevents Sequelize from pluralizing model names
    underscored: true,     // use snake_case for FKs & consistency
  },
});

// ✅ Company
const Company = sequelize.define(
  "company",
  {
    company_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_name: { type: DataTypes.STRING, allowNull: false },
    company_logo: { type: DataTypes.STRING },
  },
  { tableName: "companies", timestamps: true }
);

// ✅ User
const User = sequelize.define(
  "user",
  {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login_id: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("Admin", "HR", "Payroll", "Employee"),
      defaultValue: "Employee",
    },
    join_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  },
  { tableName: "users", timestamps: true }
);

// ✅ Attendance
const Attendance = sequelize.define(
  "attendance",
  {
    attendance_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Leave"),
      defaultValue: "Absent",
    },
    check_in: { type: DataTypes.TIME },
    check_out: { type: DataTypes.TIME },
  },
  { tableName: "attendances", timestamps: true }
);

// ✅ Leave
const Leave = sequelize.define(
  "leave",
  {
    leave_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    leave_type: { type: DataTypes.STRING },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
  },
  { tableName: "leaves", timestamps: true }
);

// ✅ Payroll
const Payroll = sequelize.define(
  "payroll",
  {
    payroll_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    month: { type: DataTypes.STRING },
    basic_salary: { type: DataTypes.DECIMAL(10, 2) },
    pf: { type: DataTypes.DECIMAL(10, 2) },
    tax: { type: DataTypes.DECIMAL(10, 2) },
    deductions: { type: DataTypes.DECIMAL(10, 2) },
    net_pay: { type: DataTypes.DECIMAL(10, 2) },
    payrun_date: { type: DataTypes.DATEONLY },
  },
  { tableName: "payrolls", timestamps: true }
);

// ✅ Relationships
Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "company_id" });

User.hasMany(Attendance, { foreignKey: "user_id", onDelete: "CASCADE" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Leave, { foreignKey: "user_id", onDelete: "CASCADE" });
Leave.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Payroll, { foreignKey: "user_id", onDelete: "CASCADE" });
Payroll.belongsTo(User, { foreignKey: "user_id" });

// ✅ Export
export { sequelize, Company, User, Attendance, Leave, Payroll };
