import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Academic Issues",
      "Personal Issues",
      "Career Guidance",
      "Mental Health",
      "Other",
    ],
    default: "Other",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Rejected"],
    default: "Pending",
  },
  reply: {
    type: String,
  },
  // NEW FIELD
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  repliedAt: {
    type: Date,
  },
  preferredDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Request", requestSchema);