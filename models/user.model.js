import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";


const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  verificationTokenExpiry: {
    type: DataTypes.BIGINT, // stores timestamps like 1712345678
    defaultValue: 0,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetOtp: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  resetOtpExpiry: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
});

export default User;
