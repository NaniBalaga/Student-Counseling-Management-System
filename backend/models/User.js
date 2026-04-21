import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  password: String,
  role: String,
  gender: String,
  dob: String,
  academicYear: String,

  verificationToken: String,
  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);