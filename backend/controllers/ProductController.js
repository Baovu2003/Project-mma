const Product = require("../models/ProductModel"); // Import model

// 🟢 Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// 🟢 Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// 🟢 Create product
exports.createProduct = async (req, res) => {
    try {
      const { name, price, stock, imageUrl, description, category } = req.body;
      console.log(name, price, stock, imageUrl, description, category);
  
      // Kiểm tra thiếu trường dữ liệu
      if (!name || price === undefined || stock === undefined || !imageUrl || !description) {
        return res.status(400).json({ message: "Missing required fields: name, price, stock, imageUrl, description" });
      }
  
      const newProduct = new Product({ name, price, stock, imageUrl, description, category });
      await newProduct.save();
  
      res.status(201).json({
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating product", error: error.message });
    }
  };
  

// 🟢 Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock,status } = req.body;

    // Kiểm tra ID hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Kiểm tra dữ liệu nhập vào
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields: name, price, stock" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, stock,status },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// 🟢 Search product
exports.searchProduct = async (req, res) => {
    const keyword = req.query.keyword;
    console.log(keyword);
    try {
      const keyword = req.query.keyword;
      console.log(keyword);
  
      let query = {}; // Mặc định lấy tất cả
  
      if (keyword && keyword.trim() !== "") {
        query = { name: { $regex: keyword, $options: "i" } }; // Tìm theo từ khóa
      }
  
      const products = await Product.find(query).limit(10);
  
      res.status(200).json({
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error) {
      res.status(500).json({ message: "Error searching products", error: error.message });
    }
  };
  
  
// 🟢 Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
