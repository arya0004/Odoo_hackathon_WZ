// // import express from "express";
// // import { userAuth } from "../middleware/user.middleware.js";
// // import { adminCreateUser } from "../Controller/admin.controller.js";
// // import { getEmployeeFullProfile, updateEmployeeFullProfile } from "../Controller/admin.controller.js";
// // import { adminSignup } from "../Controller/admin.controller.js";



// // const router = express.Router();

// // // ✅ Only Admin can create new users
// // router.post("/create-user", userAuth, adminCreateUser);

// // // 🆕 New route for updating profile

// // // Admin can view any employee’s full profile
// // router.get("/employee-profile/:user_id", userAuth, getEmployeeFullProfile);

// // // Admin can update any employee’s full profile
// // router.put("/employee-profile/:user_id", userAuth, updateEmployeeFullProfile);


// // router.post("/signup", upload.single("company_logo"), adminSignup);

// // export default router;

// // routes/admin.routes.js
// import express from "express";
// import { userAuth } from "../middleware/user.middleware.js";
// import upload from "../config/multer.js";

// import {
//   adminCreateUser,
//   getEmployeeFullProfile,
//   updateEmployeeFullProfile,
//   adminSignup,           // <-- make sure this is exported from controller (see next file)
// } from "../Controller/admin.controller.js";

// const router = express.Router();

// // Only Admin can create other users
// router.post("/create-user", userAuth, adminCreateUser);

// // Admin can view/update any employee’s full profile
// router.get("/employee-profile/:user_id", userAuth, getEmployeeFullProfile);
// router.put("/employee-profile/:user_id", userAuth, updateEmployeeFullProfile);

// // Company + first admin signup WITH company logo upload
// router.post("/signup", upload.single("company_logo"), adminSignup);

// export default router;
// routes/admin.routes.js
import express from "express";
import { userAuth } from "../middleware/user.middleware.js";
import upload from "../config/multer.js";
import {
  adminSignup,
  adminCreateUser,
  getEmployeeFullProfile,
  updateEmployeeFullProfile,
} from "../Controller/admin.controller.js";

const router = express.Router();

// quick sanity check endpoint (no auth)
router.get("/ping", (req, res) => res.json({ ok: true, route: "/api/admin" }));

// signup company + first admin (multipart)
router.post("/signup", upload.single("company_logo"), adminSignup);

// Admin-only actions
router.post("/create-user", userAuth, adminCreateUser);
router.get("/employee-profile/:user_id", userAuth, getEmployeeFullProfile);
router.put("/employee-profile/:user_id", userAuth, updateEmployeeFullProfile);

export default router;
