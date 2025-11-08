import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  isAuthenticated,
} from "../Controller/user.controller.js"; // ✅ Only import what exists
import { changePassword } from "../Controller/user.controller.js";
import { userAuth } from "../middleware/user.middleware.js";


import { getUserDetails } from "../Controller/userDetails.js";


const userRoute = express.Router();

// 🔹 Public routes
userRoute.post("/register", registerUser);
userRoute.post("/loginUser", loginUser);

// 🔹 Protected routes (require JWT)
userRoute.post("/logout", userAuth, logout);
userRoute.get("/isAuth", userAuth, isAuthenticated);
userRoute.get("/data", userAuth, getUserDetails);
// Protected route — user must be logged in
userRoute.post("/changePassword", userAuth, changePassword);


export default userRoute;
