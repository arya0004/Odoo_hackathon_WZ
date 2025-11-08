// import jwt from "jsonwebtoken";

// export const userAuth = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const cookieToken = req.cookies?.token;

//   let token = null;

//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     token = authHeader.split(" ")[1];
//   } else if (cookieToken) {
//     token = cookieToken;
//   }

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: No token provided",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: Invalid token",
//     });
//   }
// };


// import jwt from "jsonwebtoken";

// export const userAuth = (req, res, next) => {
//   try {
//     // Check if token exists in headers or cookies
//     const authHeader = req.headers.authorization;
//     const cookieToken = req.cookies?.token;

//     let token = null;

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1];
//     } else if (cookieToken) {
//       token = cookieToken;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: No token provided",
//       });
//     }

//     // Verify JWT token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach decoded user info to request
//     req.user = decoded;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: Invalid or expired token",
//     });
//   }
// };



// server/middleware/user.middleware.js
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { User } from "../config/db.js"; // ✅ Import your Sequelize User model

// dotenv.config();

// export const userAuth = async (req, res, next) => {
//   try {
//     // ✅ 1️⃣ Check for token in Authorization header or cookie
//     const authHeader = req.headers.authorization;
//     const cookieToken = req.cookies?.token;

//     let token = null;

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1];
//     } else if (cookieToken) {
//       token = cookieToken;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: No token provided",
//       });
//     }

//     // ✅ 2️⃣ Verify JWT token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ 3️⃣ Fetch the user from the database to ensure they still exist
//     const user = await User.findByPk(decoded.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found or account deleted",
//       });
//     }

//     // ✅ 4️⃣ Attach user info to request for downstream controllers
//     req.user = {
//       id: user.user_id,
//       name: user.name,
//       role: user.role,
//       company_id: user.company_id,
//     };

//     next();
//   } catch (error) {
//     console.error("❌ Auth Middleware Error:", error.message);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         message: "Session expired. Please log in again.",
//       });
//     }

//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized: Invalid token",
//     });
//   }
// };


// server/middleware/user.middleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../config/db.js"; // ✅ Sequelize User model

dotenv.config();

export const userAuth = async (req, res, next) => {
  try {
    // ✅ 1️⃣ Check for token in Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      console.log("🔴 No token found in headers or cookies");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // ✅ 2️⃣ Verify JWT token
    console.log("🟢 Incoming Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Payload:", decoded);

    // ✅ 3️⃣ Find user in DB (support both `id` and `user_id`)
    const userId = decoded.id || decoded.user_id;
    const user = await User.findByPk(userId);

    if (!user) {
      console.log("🔴 No user found for ID:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found or account deleted",
      });
    }

    // ✅ 4️⃣ Attach user info to req.user for downstream routes
    req.user = {
      id: user.user_id,
      name: user.name,
      role: user.role,
      company_id: user.company_id,
    };

    console.log("✅ Authenticated User:", req.user);
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};
