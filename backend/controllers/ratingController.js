import Rating from "../models/Rating.js";
import User from "../models/User.js";

// ✅ Student: Submit rating for a counsellor
export const submitRating = async (req, res) => {
  try {
    const { requestId, counsellorId, rating, feedback } = req.body;
    const studentId = req.body.studentId;

    // Check if already rated
    const existingRating = await Rating.findOne({ requestId, studentId });
    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this request" });
    }

    // Create rating
    const newRating = await Rating.create({
      requestId,
      studentId,
      counsellorId,
      rating,
      feedback,
    });

    // Update counsellor's average rating
    const allRatings = await Rating.find({ counsellorId });
    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (sumRatings / totalRatings).toFixed(1);

    await User.findByIdAndUpdate(counsellorId, {
      averageRating: parseFloat(averageRating),
      totalRatings,
    });

    res.status(201).json({ message: "Rating submitted successfully", rating: newRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get ratings for a specific counsellor
export const getCounsellorRatings = async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const ratings = await Rating.find({ counsellorId })
      .populate("studentId", "name email")
      .populate("requestId", "title category")
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all ratings (for admin and student browsing)
export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("studentId", "name email")
      .populate("counsellorId", "name email averageRating totalRatings")
      .populate("requestId", "title category")
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get rating by request ID (to check if student already rated)
export const getRatingByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const rating = await Rating.findOne({ requestId });
    res.status(200).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all counsellors with their ratings (for student browsing)
export const getCounsellorsWithRatings = async (req, res) => {
  try {
    const counsellors = await User.find({ 
      role: { $regex: /counsel|councel/i }, 
      isVerified: true,
      isBanned: { $ne: true }
    }).select("name email _id workStartTime workEndTime averageRating totalRatings").sort({ averageRating: -1 });
    
    res.status(200).json(counsellors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};