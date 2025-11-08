// // config/db.js
// import { Sequelize, DataTypes } from "sequelize";
// import dotenv from "dotenv";
// dotenv.config();

// // ✅ Safe Sequelize configuration
// const sequelize = new Sequelize("workzen_hrms_new", "root", process.env.DB_PASS, {
//   host: "localhost",
//   dialect: "mysql",
//   logging: false,
//   define: {
//     freezeTableName: true, // ❗ Prevents Sequelize from pluralizing model names
//     underscored: true,     // use snake_case for FKs & consistency
//   },
// });

// // ✅ Company
// const Company = sequelize.define(
//   "company",
//   {
//     company_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     company_name: { type: DataTypes.STRING, allowNull: false },
//     company_logo: { type: DataTypes.STRING },
//   },
//   { tableName: "companies", timestamps: true }
// );

// // ✅ User
// // ✅ User Model
// const User = sequelize.define(
//   "user",
//   {
//     user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

//     login_id: { type: DataTypes.STRING, unique: true },
//     name: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, allowNull: false, unique: true },
//     phone: { type: DataTypes.STRING },
//     password: { type: DataTypes.STRING, allowNull: false },
//     profile_photo: { type: DataTypes.STRING },
//     manager_id: { type: DataTypes.INTEGER, allowNull: true },

//     // ✅ Leave Balances
//     paid_leave_balance: { type: DataTypes.INTEGER, defaultValue: 24 },
//     sick_leave_balance: { type: DataTypes.INTEGER, defaultValue: 7 },
//     unpaid_leave_balance: { type: DataTypes.INTEGER, defaultValue: 0 },

//     // ✅ Role & Login
//     role: {
//       type: DataTypes.ENUM("Admin", "HR", "Payroll", "Employee"),
//       defaultValue: "Employee",
//     },
//     is_first_login: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     join_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },

//     // ✅ --- Added fields for My Profile section ---
//     job_position: { type: DataTypes.STRING },
//     department: { type: DataTypes.STRING },
//     manager_id: { type: DataTypes.INTEGER },
//     location: { type: DataTypes.STRING },

//     // ✅ Personal Info
//     date_of_birth: { type: DataTypes.DATEONLY },
//     address: { type: DataTypes.TEXT },
//     nationality: { type: DataTypes.STRING },
//     personal_email: { type: DataTypes.STRING },
//     gender: { type: DataTypes.STRING },
//     marital_status: { type: DataTypes.STRING },
//     date_of_joining: { type: DataTypes.DATEONLY },

//     // ✅ Bank Details
//     account_number: { type: DataTypes.STRING },
//     bank_name: { type: DataTypes.STRING },
//     ifsc_code: { type: DataTypes.STRING },
//     pan_no: { type: DataTypes.STRING },
//     uan_no: { type: DataTypes.STRING },
//     emp_code: { type: DataTypes.STRING },
//   },
//   {
//     tableName: "users",
//     timestamps: true,
//   }
// );


// // ✅ Attendance
// // ✅ Attendance
// const Attendance = sequelize.define(
//   "Attendance",
//   {
//     attendance_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "users",
//         key: "user_id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     },
//     date: { type: DataTypes.DATEONLY, allowNull: false },
//     status: {
//       type: DataTypes.ENUM("Present", "Absent", "Leave"),
//       defaultValue: "Absent",
//     },
//     check_in: { type: DataTypes.TIME },
//     check_out: { type: DataTypes.TIME },

//     // ✅ NEW FIELDS
//     work_hours: { type: DataTypes.FLOAT, defaultValue: 0 },
//     extra_hours: { type: DataTypes.FLOAT, defaultValue: 0 },
//   },
//   {
//     tableName: "attendances",
//     timestamps: true,
//   }
// );

// // ✅ Leave
// const Leave = sequelize.define(
//   "leave",
//   {
//     leave_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    
//     // Existing field
//     leave_type: { type: DataTypes.STRING, allowNull: false }, // e.g., "Sick Leave", "Paid Leave"

//     // 🆕 New field
//     time_off_type: {
//       type: DataTypes.ENUM("Paid Time Off", "Sick Time Off","Unpaid Time Off"),
//       allowNull: false,
//       defaultValue: "Paid Time Off",
//     },

//     start_date: { type: DataTypes.DATEONLY, allowNull: false },
//     end_date: { type: DataTypes.DATEONLY, allowNull: false },
//     status: {
//       type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
//       defaultValue: "Pending",
//     },
//     attachment: { type: DataTypes.STRING, allowNull: true }, // for sick certificate, etc.
//   },
//   { tableName: "leaves", timestamps: true }
// );

// // ✅ Payroll
// const Payroll = sequelize.define(
//   "payroll",
//   {
//     payroll_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     month: { type: DataTypes.STRING },
//     basic_salary: { type: DataTypes.DECIMAL(10, 2) },
//     pf: { type: DataTypes.DECIMAL(10, 2) },
//     tax: { type: DataTypes.DECIMAL(10, 2) },
//     deductions: { type: DataTypes.DECIMAL(10, 2) },
//     net_pay: { type: DataTypes.DECIMAL(10, 2) },
//     payrun_date: { type: DataTypes.DATEONLY },
//   },
//   { tableName: "payrolls", timestamps: true }
// );

// // ✅ Relationships
// Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE" });
// User.belongsTo(Company, { foreignKey: "company_id" });

// User.hasMany(Attendance, { foreignKey: "user_id", onDelete: "CASCADE" });
// Attendance.belongsTo(User, { foreignKey: "user_id" });

// User.hasMany(Leave, { foreignKey: "user_id", onDelete: "CASCADE" });
// Leave.belongsTo(User, { foreignKey: "user_id" });

// User.hasMany(Payroll, { foreignKey: "user_id", onDelete: "CASCADE" });
// Payroll.belongsTo(User, { foreignKey: "user_id" });

// // ✅ Self-association for manager–employee relationship
// User.belongsTo(User, { as: "Manager", foreignKey: "manager_id" });
// User.hasMany(User, { as: "Subordinates", foreignKey: "manager_id" });

// // ✅ Export
// export { sequelize, Company, User, Attendance, Leave, Payroll };



// config/db.js
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize("workzen_hrms_new", "root", process.env.DB_PASS, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
   timezone: "+05:30",
  define: {
    freezeTableName: true,
    underscored: true,
  },
});

// ==========================
// COMPANY MODEL
// ==========================
const Company = sequelize.define(
  "company",
  {
    company_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_name: { type: DataTypes.STRING, allowNull: false },
    company_logo: { type: DataTypes.STRING },
  },
  { tableName: "companies", timestamps: true }
);

// ==========================
// USER MODEL
// ==========================
const User = sequelize.define(
  "user",
  {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login_id: { type: DataTypes.STRING(100), unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    profile_photo: { type: DataTypes.STRING },
    manager_id: { type: DataTypes.INTEGER, allowNull: true },
    resume_path: { type: DataTypes.STRING, allowNull: true },



    // Leave Balances
    paid_leave_balance: { type: DataTypes.INTEGER, defaultValue: 24 },
    sick_leave_balance: { type: DataTypes.INTEGER, defaultValue: 7 },
    unpaid_leave_balance: { type: DataTypes.INTEGER, defaultValue: 0 },

    // Role & Auth
    role: {
      type: DataTypes.ENUM("Admin", "HR", "Payroll", "Employee"),
      defaultValue: "Employee",
    },
    is_first_login: { type: DataTypes.BOOLEAN, defaultValue: false },
    must_change_password: { type: DataTypes.BOOLEAN, defaultValue: false },
    reset_token: { type: DataTypes.STRING, defaultValue: null },
    reset_token_expiry: { type: DataTypes.DATE, defaultValue: null },
    join_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },

    // Job Info
    job_position: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },

    // Personal Info
    date_of_birth: { type: DataTypes.DATEONLY },
    address: { type: DataTypes.TEXT },
    nationality: { type: DataTypes.STRING },
    personal_email: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    marital_status: { type: DataTypes.STRING },
    date_of_joining: { type: DataTypes.DATEONLY },

    // Bank Info
    account_number: { type: DataTypes.STRING },
    bank_name: { type: DataTypes.STRING },
    ifsc_code: { type: DataTypes.STRING },
    pan_no: { type: DataTypes.STRING },
    uan_no: { type: DataTypes.STRING },
    emp_code: { type: DataTypes.STRING },

    // Salary Info
    monthly_wage: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    salary_structure_id: { type: DataTypes.INTEGER, allowNull: true },
    pf_rate: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    professional_tax: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    // Salary Details for Admin My Profile
basic_salary: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
hra: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
standard_allowance: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
performance_bonus: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
leave_travel_allowance: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
fixed_allowance: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
working_days_per_week: { type: DataTypes.INTEGER, allowNull: true },
break_time_hours: { type: DataTypes.FLOAT, allowNull: true },

  },
  { tableName: "users", timestamps: true }
);

// ==========================
// ATTENDANCE MODEL
// ==========================
const Attendance = sequelize.define(
  "Attendance",
  {
    attendance_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("Present", "Absent", "Leave"), defaultValue: "Absent" },
    check_in: { type: DataTypes.TIME },
    check_out: { type: DataTypes.TIME },
    work_hours: { type: DataTypes.FLOAT, defaultValue: 0 },
    extra_hours: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  { tableName: "attendances", timestamps: true }
);

// ==========================
// LEAVE MODEL
// ==========================
const Leave = sequelize.define(
  "leave",
  {
    leave_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    leave_type: { type: DataTypes.STRING, allowNull: false },
    time_off_type: {
      type: DataTypes.ENUM("Paid Time Off", "Sick Time Off", "Unpaid Time Off"),
      defaultValue: "Paid Time Off",
    },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("Pending", "Approved", "Rejected"), defaultValue: "Pending" },
    attachment: { type: DataTypes.STRING },
  },
  { tableName: "leaves", timestamps: true }
);

// ==========================
// PAYROLL MODEL
// ==========================
const Payroll = sequelize.define(
  "payroll",
  {
    payroll_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    month: { type: DataTypes.STRING(20), allowNull: true },
    basic_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    pf: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    tax: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    deductions: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    net_pay: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    payrun_date: { type: DataTypes.DATEONLY, allowNull: true },
    breakdown: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "payrolls", timestamps: true }
);

// ==========================
// SALARY STRUCTURE MODEL
// ==========================
const SalaryStructure = sequelize.define(
  "SalaryStructure",
  {
    salary_structure_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
  },
  { tableName: "salary_structures", timestamps: true }
);

// ==========================
// SALARY COMPONENT MODEL
// ==========================
const SalaryComponent = sequelize.define(
  "SalaryComponent",
  {
    salary_component_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    salary_structure_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("fixed", "percentage"), defaultValue: "fixed" },
    apply_on: { type: DataTypes.ENUM("WAGE", "BASIC"), defaultValue: "WAGE" },
    value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    is_deduction: { type: DataTypes.BOOLEAN, defaultValue: false },
    sequence: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: "salary_components", timestamps: true }
);

// ==========================
// RELATIONSHIPS
// ==========================
Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "company_id" });

User.belongsTo(User, { as: "Manager", foreignKey: "manager_id" });
User.hasMany(User, { as: "Subordinates", foreignKey: "manager_id" });

User.hasMany(Attendance, { foreignKey: "user_id", onDelete: "CASCADE" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Leave, { foreignKey: "user_id", onDelete: "CASCADE" });
Leave.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Payroll, { foreignKey: "user_id", onDelete: "CASCADE" });
Payroll.belongsTo(User, { foreignKey: "user_id" });

// Salary Structure <-> Company
Company.hasMany(SalaryStructure, { foreignKey: "company_id", onDelete: "CASCADE" });
SalaryStructure.belongsTo(Company, { foreignKey: "company_id" });

// Salary Structure <-> Salary Component
SalaryStructure.hasMany(SalaryComponent, { foreignKey: "salary_structure_id", onDelete: "CASCADE" });
SalaryComponent.belongsTo(SalaryStructure, { foreignKey: "salary_structure_id" });

// Salary Structure <-> User
SalaryStructure.hasMany(User, { foreignKey: "salary_structure_id" });
User.belongsTo(SalaryStructure, { foreignKey: "salary_structure_id" });

// ==========================
// EXPORTS
// ==========================
export { sequelize, Company, User, Attendance, Leave, Payroll, SalaryStructure, SalaryComponent };
