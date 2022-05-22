const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isUser, isAdmin } = require("../middlewares/auth");
const {
  createNewOrder,
  getOrder,
  updateOrder,
  getAllOrder,
  userGetAllOrder,
} = require("../controllers/order.contrroller");

router.post(
  "/createNewOrder",
  loginRequired,
  isUser,
  validate([
    body("delivery", "Invalid information delivery").exists().notEmpty(),
  ]),
  createNewOrder
);
router.get("/getOrder/:orderId", loginRequired, isUser, getOrder);

router.get("/userGetAllOrders", loginRequired, isUser, userGetAllOrder);

router.get("/getAllOrder", loginRequired, isAdmin, getAllOrder);

router.put("/updateOrder/:orderId", loginRequired, isUser, updateOrder);

module.exports = router;
