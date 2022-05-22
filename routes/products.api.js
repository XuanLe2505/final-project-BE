const express = require("express");
const router = express.Router();
const { body, param, header } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isAdmin } = require("../middlewares/auth");
const {
  addNewProduct,
  updateInfoProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/product.controller");
const upload = require("../helpers/multer");

/**
 * @route POST /products
 * @description Admin add a new product
 * @access Login required, role admin
 */
router.post(
  "/admin/addNewProduct",
  loginRequired,
  isAdmin,
  // validate([
  //   body("name", "Invalid name").exists().notEmpty(),
  //   body("productCode", "Invalid productCode").exists().notEmpty(),
  //   body("category", "Invalid category").exists().notEmpty(),
  //   body("subcategory", "Invalid subcategory").exists().notEmpty(),
  //   body("description", "Invalid description").exists().notEmpty(),
  //   body("price", "Invalid price").exists().notEmpty(),
  //   body("countInStock", "Invalid countInStock").exists().notEmpty(),
  //   body("discount", "Invalid discount").exists().notEmpty(),
  // ]),
  upload.single("image"),
  addNewProduct
);

/**
 * @route PUT /products
 * @description Admin update information of product
 * @access Login required, role admin
 */
router.put("/products/:productId", loginRequired, isAdmin, updateInfoProduct);

/**
 * @route DELETE /products
 * @description Admin delete product
 * @access Login required, role admin
 */
router.delete("/products/:productId", loginRequired, isAdmin, deleteProduct);

/**
 * @route Get /products
 * @description User can see products with pagination
 * @access publish
 */
router.get("/products", getAllProducts);

/**
 * @route Get /single product
 * @description User can see detail of product
 * @access Login required
 */
router.get("/products/:productId", getSingleProduct);

module.exports = router;
