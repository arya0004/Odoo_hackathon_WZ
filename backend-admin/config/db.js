// config/db.js
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// ✅ Database connection
const sequelize = new Sequelize("workzen_hrms_new", "root", process.env.DB_PASS, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

/* -------------------------------------------------------------------------- */
/*                                MODELS START                                */
/* -------------------------------------------------------------------------- */

// ✅ Company
const Company = sequelize.define(
  "Company",
  {
    company_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    freezeTableName: true,
  }
);

// ✅ User
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    login_id: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(191), // safe for utf8mb4 unique index
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Admin", "HR", "Payroll", "Employee"),
      defaultValue: "Employee",
    },
    join_date: {
      type: DataTypes.DATEONLY,
      defaultValue: Sequelize.NOW,
    },
    must_change_password: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
reset_token: {
  type: DataTypes.STRING,
  defaultValue: null,
},
reset_token_expiry: {
  type: DataTypes.DATE,
  defaultValue: null,
},
  },
  {
    tableName: "users",
    timestamps: true,
    freezeTableName: true,
  }
);

// ✅ Attendance
const Attendance = sequelize.define(
  "Attendance",
  {
    attendance_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Leave"),
      defaultValue: "Absent",
    },
    check_in: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    check_out: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "attendances",
    timestamps: true,
    freezeTableName: true,
  }
);

// ✅ Leave
const Leave = sequelize.define(
  "Leave",
  {
    leave_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leave_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
  },
  {
    tableName: "leaves",
    timestamps: true,
    freezeTableName: true,
  }
);

// ✅ Payroll
const Payroll = sequelize.define(
  "Payroll",
  {
    payroll_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    month: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    basic_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    pf: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    net_pay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    payrun_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "payrolls",
    timestamps: true,
    freezeTableName: true,
  }
);

/* -------------------------------------------------------------------------- */
/*                             MODEL RELATIONSHIPS                            */
/* -------------------------------------------------------------------------- */

// Company ↔ Users
Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
User.belongsTo(Company, { foreignKey: "company_id" });

// User ↔ Attendance
User.hasMany(Attendance, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

// User ↔ Leave
User.hasMany(Leave, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Leave.belongsTo(User, { foreignKey: "user_id" });

// User ↔ Payroll
User.hasMany(Payroll, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Payroll.belongsTo(User, { foreignKey: "user_id" });

/* -------------------------------------------------------------------------- */
/*                                EXPORT MODELS                               */
/* -------------------------------------------------------------------------- */

export { sequelize, Company, User, Attendance, Leave, Payroll };
