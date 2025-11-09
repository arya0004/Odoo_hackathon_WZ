//import multer from "multer";
//import path from "path";
//import fs from "fs";
//
//// Ensure uploads folder exists
//const uploadDir = path.resolve("uploads");
//if (!fs.existsSync(uploadDir)) {
//  fs.mkdirSync(uploadDir);
//}
//
//// Configure storage
//const storage = multer.diskStorage({
//  destination: (req, file, cb) => {
//    cb(null, "uploads/"); // save in uploads folder
//  },
//  filename: (req, file, cb) => {
//    const uniqueName = Date.now() + "-" + file.originalname;
//    cb(null, uniqueName);
//  },
//});
//
//const upload = multer({ storage });
//export default upload;
// server/config/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Define base upload paths
const baseDir = path.resolve("uploads");
const companyLogoDir = path.join(baseDir, "company_logos");

// ✅ Ensure directories exist
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);
if (!fs.existsSync(companyLogoDir)) fs.mkdirSync(companyLogoDir);

// ✅ Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save all company logos in uploads/company_logos/
    cb(null, companyLogoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});

// ✅ File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, JPEG, or PNG files are allowed!"), false);
};

// ✅ Limit file size to 2MB
const limits = { fileSize: 2 * 1024 * 1024 };

// ✅ Initialize multer
const upload = multer({ storage, fileFilter, limits });

export default upload;

