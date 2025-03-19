const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    houseNo: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    province: { type: String, required: true }, 
    district: { type: String, required: true }, 
    ward: { type: String, required: true }, 
    country: { type: String, default: "Vietnam" },
  },
  delivery: { type: String, required: true},
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: { type: String, enum: ["success", "failed"], default: "failed" },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Order = mongoose.model("Order",orderSchema);

module.exports = Order;