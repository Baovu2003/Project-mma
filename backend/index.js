const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // Nếu dùng bcryptjs
const moment = require("moment");
const nodemailer = require("nodemailer");
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const dotenv = require("dotenv");
dotenv.config();

const connectDb = require("./config/db"); // Import kết nối MongoDB
const productRouter = require("./routes/productRouter"); // Import routes
const User = require("./models/User");
const Order = require("./models/orderModel");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kết nối cơ sở dữ liệu
connectDb();
app.use("/api/v1/products", productRouter);
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/adminRoutes");
const ProductModel = require("./models/ProductModel");
app.use("/api/v1", authRoutes);
app.post("/api/v1/addresses", async (req, res) => {
  try {
    const { userId, address } = req.body;

    console.log({ userId, address });
    //find the user by the Userid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //add the new address to the user's addresses array
    user.addresses.push(address);
    console.log(user);

    //save the updated user in te backend
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error addding address" });
  }
});
app.get("/api/v1/addresses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieveing the addresses" });
  }
});
// API xóa địa chỉ
app.delete("/api/v1/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    user.addresses.splice(addressIndex, 1);
    await user.save();
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Error deleting address", error: error.message });
  }
});
app.put("/api/v1/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { address } = req.body;

    console.log(req.params)
    console.log(req.body)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addrIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addrIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses[addrIndex] = { ...user.addresses[addrIndex], ...address };
    await user.save();

    res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating address", error: error.message });
  }
});
app.delete("/api/v1/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Tìm và xóa địa chỉ trong mảng addresses
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Error deleting address", error: error.message });
  }
});
app.post("/api/v1/vnpay/create_payment", async (req, res) => {
  try {
    const { amount, orderInfo, returnUrl, orderData } = req.body;
    if (!amount || !orderInfo) {
      return res.status(400).json({ message: "Thiếu amount hoặc orderInfo" });
    }

    console.log({ amount, orderInfo, orderData, returnUrl });
    const newOrder = new Order({
      user: orderData.userId,
      products: orderData.cartItems,
      totalPrice: orderData.totalPrice,
      shippingAddress: orderData.shippingAddress,
      delivery: orderData.deliveryOption,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "failed", // Chưa thanh toán
    });
    console.log("Saved order:", newOrder);
    const orderId = newOrder._id.toString();
    console.log("orderId:", orderId);

    await newOrder.save();
    // VNPAY configuration
    const tmnCode = "MEF2SA9J";
    const secretKey = "5UE6HOLD0MYZWDH3YE44KJSXZRF87D7A";
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    // Payment parameters
    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Amount: amount * 100, // VNPAY expects amount in VND * 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId, // Unique transaction reference
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_ReturnUrl: returnUrl || "http://localhost:8000/api/v1/check-payment-vnpay",
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});

    // Create query string
    const queryString = new URLSearchParams(sortedParams).toString();

    // Generate secure hash
    const hmac = crypto.createHmac("sha512", secretKey);
    const secureHash = hmac.update(queryString).digest("hex");

    // Construct final payment URL
    const paymentUrl = `${vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;

    console.log("Generated Payment URL:", paymentUrl);
    res.status(201).json({ paymentUrl,orderId });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/v1/check-payment-vnpay", async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    console.log("VNPay response in /api/check-payment-vnpay :", vnp_Params);

    delete vnp_Params["vnp_SecureHash"];

    // Sắp xếp lại tham số theo thứ tự alphabet1
    const sortedParams = sortObject(vnp_Params);
    console.log("Sorted Params sortedParams:", sortedParams);

    // Tạo lại secureHash để so sánh
    const queryString = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join("&");
    console.log("Query String trước khi tạo hash:", queryString);

    const secret_Key = "5UE6HOLD0MYZWDH3YE44KJSXZRF87D7A";
    // hash
    const hmac = crypto.createHmac("sha512", secret_Key);
    const expectedHash = hmac
      .update(Buffer.from(queryString, "utf-8"))
      .digest("hex");

    console.log("Secure hash:", secureHash);
    console.log({ expectedHash });

    if (secureHash !== expectedHash) {
      return res.status(400).json({ message: "Giao dịch không hợp lệ" });
    }

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      console.log("Payment successful");

      const orderId = vnp_Params["vnp_TxnRef"]; 
      console.log("orderId:", orderId);

      const order = await Order.findById(orderId); 
      console.log("Orrder thay status", order);
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }
      // Cập nhật trạng thái đơn hàng thành "paid"
      order.paymentStatus = "success";
      console.log("Orrder after status", order);
      await order.save();
      const isMobile = req.headers["user-agent"]?.includes("Mobile");

      if (isMobile) {
        // **Deep Linking trên Mobile**
        // return res.redirect(`http://localhost:8081/payment-success`);
        // return res.redirect(`http://10.0.2.2:8081/payment-success?orderId=${order._id}`);
        return res.redirect(`http://localhost:8081/payment-success?orderId=${order._id}`);
      } else {
        // **Redirect trên Web**
        return res.redirect(`http://localhost:8081/payment-success?orderId=${order._id}`);
      }
    } else {
      res.status(400).json({ message: "Payment failed", data: vnp_Params });
    }
  } catch (error) {
    console.error("Lỗi kiểm tra thanh toán VNPay:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.post("/api/v1/orders", async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
      deliveryOption,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !userId ||
      !cartItems ||
      !totalPrice ||
      !shippingAddress ||
      !paymentMethod ||
      !deliveryOption
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra xem userId có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra và trừ số lượng sản phẩm trong kho
    for (const item of cartItems) {
      const productId = item.id || item._id; // Tùy thuộc vào cách bạn lưu ID
      const product = await ProductModel.findById(productId); // Giả sử bạn có model Product

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Trừ số lượng trong kho
      product.stock -= item.quantity;
      await product.save();
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      user: userId,
      products: cartItems.map((item) => ({
        name: item.name,
        _id: item.id || item._id,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
      totalPrice,
      shippingAddress,
      paymentMethod,
      delivery: deliveryOption,
      status: "Pending", // Trạng thái ban đầu
    });

    // Lưu đơn hàng vào cơ sở dữ liệu
    await newOrder.save();

    // Trả về phản hồi thành công
    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder._id,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});
app.put("/api/v1/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Nếu trạng thái mới là "failed" và trạng thái cũ là "Pending", cộng lại số lượng sản phẩm
    if (status === "failed" && order.status === "Pending") {
      for (const product of order.products) {
        const productInDb = await ProductModel.findById(product._id); // Giả sử bạn có model Product
        if (!productInDb) {
          return res.status(404).json({ message: `Product with ID ${product._id} not found` });
        }

        // Cộng lại số lượng sản phẩm vào kho
        productInDb.stock += product.quantity;
        await productInDb.save();
      }
    }

    // Cập nhật trạng thái đơn hàng
    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
});
app.get("/api/v1/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order" });
  }
});

app.get("/api/v1/orders/user/:userId", async (req, res) => {
  try {
    console.log(req.params.userId)
    const orders = await Order.find({ user: req.params.userId });
   console.log({orders})
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders" });
  }
});
app.get("/api/v1/users/:userId",async (req, res) => {
  console.log("req.params.userId",req.params.userId)
  try {
    const user = await User.findById(req.params.userId).populate("orders"); // Lấy user và đơn hàng
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});
app.get("/api/v1/users",async (req, res) => {
  console.log("hello")
  try {
    const user = await User.find().populate("orders"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});

app.use("/api/v2/admin", adminRoutes);
// API để lấy thống kê tổng quan
adminRoutes.get("/dashboard/stats", async (req, res) => {
  try {
    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments({
      status: "Completed",
      paymentStatus: "success"
    });

    const totalOrders11 = await Order.find();
    console.log("totalOrders11",totalOrders11)
    
    // Tổng số người dùng
    const totalUsers = await User.countDocuments();
    
      // Tính tổng số sản phẩm đã bán
      const totalProductsSold = await Order.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            total: { $sum: "$products.quantity" }
          }
        }
      ]);

    // Lấy top 5 sản phẩm bán chạy nhất
    const topProducts = await Order.aggregate([
      // Unwind để tách mỗi sản phẩm trong array products
      { $unwind: "$products" },
      // Group theo product ID và tính tổng số lượng
      {
        $group: {
          _id: "$products._id",
          name: { $first: "$products.name" },
          totalQuantity: { $sum: "$products.quantity" },
          imageUrl: { $first: "$products.imageUrl" }
        }
      },
      // Sắp xếp theo số lượng giảm dần
      { $sort: { totalQuantity: -1 } },
      // Giới hạn 5 sản phẩm
      { $limit: 5 }
    ]);
    console.log("topProducts",topProducts)

    res.status(200).json({
      totalOrders,
      totalUsers,
      totalProductsSold: totalProductsSold[0]?.total || 0,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching dashboard stats", 
      error: error.message 
    });
  }
});
// ... (rest of your backend code remains unchanged)
app.use((err, req, res, next) => {
  console.error(" Server Error:", err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(` Server is running at http://localhost:${port}`);
});

