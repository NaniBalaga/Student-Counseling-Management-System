import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import nodemailer from "nodemailer"; // ✅ Added for SMTP fix
import ratingRoutes from "./routes/ratingRoutes.js";

const app = express();

// ✅ middleware
app.use(cors());
app.use(express.json());

// ✅ connect DB AFTER env load
connectDB();

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ Added: SMTP Email Sender Route
// You can use this exact logic inside your auth/request controllers
app.post("/api/send-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Student Counselling" <${process.env.EMAIL_USER}>`,
      to: req.body.email, // Pass {"email": "target@gmail.com"} in Postman
      subject: req.body.subject || "System Notification",
      text: req.body.message || "Your SMTP is working perfectly!",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    
    res.status(200).json({ success: true, message: "Email sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
});

// ✅ start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});