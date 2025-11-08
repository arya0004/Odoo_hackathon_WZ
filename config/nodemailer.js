import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("⚙️ Creating transporter with:", {
  user: process.env.SMTP_USER,
  passExists: !!process.env.SMTP_PASS,
});

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;
