const express = require("express");
const bcrypt = require("bcryptjs"); // Nếu dùng bcryptjs
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validateToken = require("../authMiddleware");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

router.get("/validate-token", validateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
  });
const sendVerificationEmail = async (email, verificationToken) => {
    console.log(email);
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    console.log(process.env.EMAIL_PASSWORD);
    console.log(transporter);
  
    // Compose the email message
    const mailOptions = {
      from: "CoffeeShop",
      to: email,
      subject: "Email Verification",
      text: `Please click the following link to verify your email: http://localhost:8000/api/v1/verify/${verificationToken}`,
    };
  
    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log({ name, email, password });
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log({ hashedPassword });
  
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        verified: false,
      });
      console.log({ newUser });
  
      newUser.verificationToken = crypto.randomBytes(20).toString("hex");
      await newUser.save();
  
      sendVerificationEmail(newUser.email, newUser.verificationToken);
  
      res
        .status(201)
        .json({ message: "Please check your email for verification." });
    } catch (error) {
      console.error("Registration Error:", error); // In lỗi chi tiết
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  });
  
  //endpoint to verify the email
  router.get("/verify/:token", async (req, res) => {
    try {
      const token = req.params.token;
  
      //Find the user witht the given verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }
  
      //Mark the user as verified
      user.verified = true;
      user.verificationToken = undefined;
  
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Email Verificatioion Failed" });
    }
  });
  
  const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
  
    return secretKey;
  };
  
  const secretKey = generateSecretKey();
// 🔹 Đăng nhập (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Kiểm tra email đã xác thực chưa
    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Tạo access token (15 phút)
    const accessToken = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "15m",
    });

    // Tạo refresh token (7 ngày)
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Lưu refresh token vào DB (hoặc Redis)
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      username: user.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// 🔹 Tạo Access Token mới từ Refresh Token
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Kiểm tra refresh token có hợp lệ không
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Kiểm tra refresh token có khớp trong DB không
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Tạo access token mới (15 phút)
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// 🔹 Đăng xuất (Logout)
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

  try {
    // Kiểm tra refresh token có trong DB không
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: 1 } }, // Xóa refresh token
      { new: true }
    );

    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
