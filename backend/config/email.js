import dotenv from "dotenv";
dotenv.config(); // ✅ LOAD HERE ALSO

import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log("❌ Email Error:", err);
  } else {
    console.log("✅ Email Server Ready");
  }
});

export default transporter;