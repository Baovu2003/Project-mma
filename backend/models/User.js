const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  addresses: [
    {
      name: { type: String, required: true },
      mobileNo: { type: String, required: true },
      houseNo: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String },
      province: { type: String, required: true }, 
      district: { type: String, required: true }, 
      ward: { type: String, required: true }, 
      country: { type: String, default: "Vietnam" },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User",userSchema);

module.exports = User