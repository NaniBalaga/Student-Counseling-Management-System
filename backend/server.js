import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();

// ✅ middleware
app.use(cors());
app.use(express.json());

// ✅ connect DB AFTER env load
connectDB();

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});