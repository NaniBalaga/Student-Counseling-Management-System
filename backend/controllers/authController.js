import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/email.js";
import crypto from "crypto";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      gender,
      dob,
      academicYear,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
      gender,
      dob,
      academicYear,
      verificationToken,
      isVerified: false,
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    const emailHTML = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; padding: 40px; border-radius: 12px; color: #ffffff; border: 1px solid #222;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffd700; margin: 0; font-size: 28px;">Welcome to Campus!</h1>
        </div>
        <p style="color: #cccccc; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 40px;">
          Hi ${name},<br><br>
          You're almost there! Please verify your email address to complete your registration and unlock full access to your account.
        </p>
        <div style="text-align: center; margin-bottom: 40px;">
          <a href="${verifyLink}" style="background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%); color: #000; padding: 16px 36px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);">
            Verify My Account
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #333; margin-bottom: 20px;">
        <p style="color: #777; font-size: 12px; text-align: center; line-height: 1.5;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verifyLink}" style="color: #ffc107; word-break: break-all;">${verifyLink}</a><br><br>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      to: email,
      subject: "Action Required: Verify Your Account",
      html: emailHTML,
    });

    res.status(201).json({
      message: "Registered successfully. Please check your email to verify.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY =================
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Your account has been verified successfully. You can now log in." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ NEW: Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
        isBanned: true
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first. Check your inbox.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL USERS (FOR ADMIN) =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE USER (FOR ADMIN) =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: BAN USER (FOR ADMIN)
export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBanned: true, 
        banReason: reason || "Violation of terms",
        bannedAt: Date.now()
      },
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User has been banned", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: UNBAN USER (FOR ADMIN)
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBanned: false, 
        banReason: "",
        bannedAt: null
      },
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User has been unbanned", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: UPDATE WORKING HOURS (FOR COUNSELLOR)
export const updateWorkingHours = async (req, res) => {
  try {
    const { workStartTime, workEndTime } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { workStartTime, workEndTime },
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Working hours updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: CHECK BAN STATUS
export const checkBanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("isBanned banReason");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};