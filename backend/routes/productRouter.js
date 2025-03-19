const express = require('express');
const productRouter = express.Router();

const productController = require("../controllers/ProductController")

productRouter.get('/', productController.getAllProducts);
productRouter.get('/search', productController.searchProduct);
productRouter.get('/:id', productController.getProductById);

productRouter.post('/', productController.createProduct);

productRouter.put('/:id', productController.updateProduct);

productRouter.delete('/:id', productController.deleteProduct);

module.exports = productRouter;