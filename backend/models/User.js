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

  // ✅ NEW: Working hours for counsellors
  workStartTime: String,
  workEndTime: String,
  isWorkingNow: { type: Boolean, default: false },

  // ✅ NEW: Ban/Unban feature
  isBanned: { type: Boolean, default: false },
  banReason: String,
  bannedAt: Date,

  // ✅ NEW: Rating system
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);