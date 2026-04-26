import Request from "../models/Request.js";
import User from "../models/User.js";

// Student: Create a new request
export const createRequest = async (req, res) => {
  try {
    const { studentId, counsellorId, title, description, category, priority } = req.body;
    const request = await Request.create({
      studentId,
      counsellorId,
      title,
      description,
      category,
      priority
    });
    res.status(201).json({ message: "Request sent successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get requests based on role
export const getRequests = async (req, res) => {
  try {
    const { userId, role } = req.params;
    let requests = [];

    if (role === "student") {
      requests = await Request.find({ studentId: userId }).populate("counsellorId", "name email workStartTime workEndTime");
    } else if (role === "counsellor" || role === "counceller" || role === "counseller") {
      requests = await Request.find({ counsellorId: userId }).populate("studentId", "name email");
    } else if (role === "admin") {
      requests = await Request.find()
        .populate("studentId", "name email")
        .populate("counsellorId", "name email");
    }

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Counsellor: Update request status (Accept/Reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    
    // Updates `updatedAt` so student notifications sort correctly
    const request = await Request.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
    res.status(200).json({ message: `Request marked as ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Counsellor: Reply to an accepted request
export const replyToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    // Updates `updatedAt` so student notifications sort correctly
    const request = await Request.findByIdAndUpdate(
      id, 
      { reply, status: "Completed", repliedAt: Date.now(), updatedAt: Date.now() }, 
      { new: true }
    );
    res.status(200).json({ message: "Reply sent successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all counsellors for students to choose from
export const getCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({ 
      role: { $regex: /counsel|councel/i }, 
      isVerified: true,
      isBanned: { $ne: true }
    }).select("name email _id workStartTime workEndTime averageRating totalRatings");
    
    res.status(200).json(counsellors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE REQUEST (FOR ADMIN) =================
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};