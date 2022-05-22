const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isUser } = require("../middlewares/auth");
const { addToCart } = require("../controllers/cart.controller");

router.post(
  "/cart",
  loginRequired,
  isUser,
  validate([body("cartProducts", "Invalid cartProducts").exists().notEmpty()]),
  addToCart
);

// router.delete(
//   "/cart/:productId",
//   loginRequired,
//   isUser,
//   // validate([param("productId", "Invalid productId").exists().notEmpty()]),
//   deleteItems
// )

module.exports = router;
