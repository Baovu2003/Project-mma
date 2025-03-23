const { default: mongoose } = require("mongoose");


const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    // category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: { type: String, required: true, default:"active" },
},{
    timestamps: true,
})

module.exports = mongoose.model("Product", ProductSchema);