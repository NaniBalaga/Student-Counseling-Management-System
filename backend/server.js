import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import nodemailer from "nodemailer";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

// Email route
app.post("/api/send-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Student Counselling" <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: req.body.subject || "System Notification",
      text: req.body.message || "SMTP working!",
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent",
      messageId: info.messageId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email failed",
      error: error.message,
    });
  }
});

// ❗ IMPORTANT: Export app (required for Vercel)
export default app;

// ❗ Only run locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
