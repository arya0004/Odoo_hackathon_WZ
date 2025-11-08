import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  isAuthenticated,
  getUserProfile,
} from "../Controller/user.controller.js"; // ✅ Only import what exists
import upload from "../config/multer.js";
import { updateProfilePhoto } from "../Controller/user.controller.js";


import { getUserDetails } from "../Controller/userDetails.js";
import { userAuth } from "../middleware/user.middleware.js";

const userRoute = express.Router();

// 🔹 Public routes
userRoute.post("/register", registerUser);
userRoute.post("/loginUser", loginUser);

// 🔹 Protected routes (require JWT)
userRoute.post("/logout", userAuth, logout);
userRoute.get("/isAuth", userAuth, isAuthenticated);
userRoute.get("/data", userAuth, getUserDetails);
userRoute.get("/profile/:id", userAuth, getUserProfile);

userRoute.post("/upload-photo", userAuth, upload.single("photo"), updateProfilePhoto);


export default userRoute;
