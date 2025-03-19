const jwt = require("jsonwebtoken");
const User = require("./models/User");
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const validateToken = async (req, res, next) => {
  try {
    console.log("🛠️ Headers nhận được:", req.headers); 
    console.log("📡 Authorization Header:", req.header("Authorization")); 

    const token = req.header("Authorization")?.split(" ")[1]; 
    console.log({ token });
    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    // Xác minh token
    const decoded = jwt.verify(token, SECRET_KEY); 

    // Kiểm tra user có tồn tại trong DB không
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    req.user = user; 
    next(); 
  } catch (error) {
    return res
      .status(401)
      .json({ valid: false, message: "Token expired or invalid" });
  }
};

module.exports = validateToken;
