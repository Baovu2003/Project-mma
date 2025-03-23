const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Thêm fs để xử lý file

const Order = require("../../models/orderModel");
const User = require("../../models/User");
const Product = require("../../models/ProductModel");

const adminRoutes = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer với nhiều tùy chọn hơn
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique và an toàn
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Cấu hình upload với validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Chỉ cho phép upload 1 file
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra type của file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
  }
});
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};
adminRoutes.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error: error.message });
  }
});
// Route xử lý upload ảnh với xử lý lỗi tốt hơn
adminRoutes.post('/products', upload.single('imageUrl'), async (req, res) => {
  try {
    // 1. Xử lý upload ảnh
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    // Tạo URL đầy đủ cho ảnh
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // 2. Lấy dữ liệu sản phẩm từ body
    const { name, description, price, stock, status } = req.body;

    // Validate input
    if (!name || !description || !price || !stock) {
      // Xóa file nếu validation thất bại
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // 3. Tạo sản phẩm mới với imageUrl
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      imageUrl, // Sử dụng URL từ bước upload
      status: status || 'active',
    });

    await newProduct.save();

    // 4. Trả về phản hồi thành công
    res.status(201).json({
      success: true,
      message: 'Product created successfully with image',
      product: newProduct,
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });

  } catch (error) {
    // Xóa file nếu có lỗi xảy ra
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});
adminRoutes.put(
  "/products/:productId",
  upload.single("imageUrl"),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { name, description, price, stock, status } = req.body;

      // Tìm sản phẩm cần cập nhật
      const product = await Product.findById(productId);
      if (!product) {
        if (req.file) fs.unlinkSync(req.file.path); // Xóa file nếu sản phẩm không tồn tại
        return res.status(404).json({ message: "Product not found" });
      }

      // Xử lý ảnh nếu có upload mới
      let imageUrl = product.imageUrl;
      if (req.file) {
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        const oldImagePath = path.join(__dirname, "..", "uploads", path.basename(product.imageUrl));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); // Xóa ảnh cũ
      }

      // Cập nhật các trường
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.stock = stock !== undefined ? stock : product.stock;
      product.status = status || product.status;
      if (req.file) product.imageUrl = imageUrl;

      // Validate dữ liệu
      if (!product.name || !product.description || !product.price || product.stock === undefined) {
        if (req.file) fs.unlinkSync(req.file.path); // Xóa file nếu validate thất bại
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Lưu sản phẩm
      await product.save();

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
        ...(req.file && {
          file: {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
        }),
      });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path); // Xóa file nếu có lỗi
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
    }
  }
);
// Middleware xử lý lỗi cho multer
adminRoutes.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
});

// Delete a product
adminRoutes.delete("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// --- Order Management ---

// Get all orders (with pagination and filtering)
adminRoutes.get("/orders", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    console.log({ page, limit, status, paymentStatus });
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();

      console.log(orders)
    const count = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error: error.message });
  }
});
adminRoutes.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order", error: error.message });
  }
});


adminRoutes.put("/orders/:orderId", async (req, res) => {
    try {
      console.log("Received update request:", {
        orderId: req.params.orderId,
        body: req.body
      });
  
      const { status, paymentStatus } = req.body;
      const updateData = {};
      
      const currentOrder = await Order.findById(req.params.orderId);
      console.log("Current order:", currentOrder);
      
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Chỉ ngăn chặn việc thay đổi paymentStatus của đơn hàng VNPay đã thanh toán thành công
      if (currentOrder.paymentMethod === 'VNPay' && currentOrder.paymentStatus === 'success') {
        if (paymentStatus) {
          return res.status(400).json({ 
            message: "Cannot update payment status for successful VNPay orders" 
          });
        }
      }
  
      // Cập nhật các trường được phép
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
  
      console.log("Update data:", updateData);
  
      const order = await Order.findByIdAndUpdate(req.params.orderId, updateData, {
        new: true,
      }).populate("user", "name email");
  
      console.log("Updated order:", order);
  
      res.status(200).json({ message: "Order updated successfully", order });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Error updating order", error: error.message });
    }
  });

adminRoutes.delete("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
});

// --- User Management ---

// Get all users (with pagination)
adminRoutes.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
});

// Get a single user by ID
adminRoutes.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("orders");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error: error.message });
  }
});

// Update user (e.g., role, name, email)
adminRoutes.put("/users/:userId", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete a user
adminRoutes.delete("/users/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Order.deleteMany({ user: req.params.userId });
    res.status(200).json({ message: "User and associated orders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

module.exports = adminRoutes;