const { catchAsync, sendResponse, AppError } = require("../helpers/utilities");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");

const orderController = {};

orderController.createNewOrder = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;
  const { delivery } = req.body;

  const user = await User.findById(currentUserId).populate({
    path: "cart",
    populate: {
      path: "products.product",
      model: "Products",
    },
  });

  const total = user.cart.products.reduce(
    (acc, product) => acc + product.quantity * product.product.price,
    0
  );
  if (delivery.paymentMethod === "cash") {
    const userOrder = await Order.create({
      user: currentUserId,
      products: user.cart.products,
      total,
      paymentMethod: delivery.paymentMethod,
      shipping: {
        address: delivery.address,
        city: delivery.city,
        country: delivery.country,
        phone: delivery.phone,
      },
    });

    let cart = await Cart.findOne({ user: currentUserId });

    cart.products = [];

    cart = await cart.save();

    return sendResponse(
      res,
      200,
      true,
      userOrder,
      null,
      "Create new order successfully"
    );
  } else {
    if (user.balance < total) {
      throw new AppError(401, "Balance is not enough", "Create Order Error");
    }

    const userOrder = await Order.create({
      user: currentUserId,
      products: user.cart.products,
      total,
      paymentMethod: delivery.paymentMethod,
      shipping: {
        address: delivery.address,
        city: delivery.city,
        country: delivery.country,
        phone: delivery.phone,
      },
    });

    let cart = await Cart.findOne({ user: currentUserId });

    cart.products = [];

    cart = await cart.save();

    return sendResponse(
      res,
      200,
      true,
      userOrder,
      null,
      "Create new order successfully"
    );
  }
});
orderController.userGetAllOrder = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isDeleted: false, user: currentUserId }];

  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Order.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const userOrders = await Order.find(filterCrireria)
    .populate("user")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { userOrders, totalPages, totalItem: count },
    null,
    "Get order by userId successfully"
  );
});

orderController.getAllOrder = catchAsync(async (req, res, next) => {
  const allOrder = await Order.find()
    .populate("user")
    .populate({
      path: "products",
      populate: {
        path: "product",
        model: "Products",
      },
    });

  return sendResponse(
    res,
    200,
    true,
    { allOrder },
    null,
    "Get all order successfully"
  );
});

orderController.getOrder = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;
  const { orderId } = req.params;

  const userOrder = await Order.findOne({
    _id: orderId,
    user: currentUserId,
  })
    .populate("user")
    .populate({
      path: "products",
      populate: {
        path: "product",
        model: "Products",
      },
    });

  return sendResponse(
    res,
    200,
    true,
    userOrder,
    null,
    "Get order by orderId successfully"
  );
});

orderController.updateOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const userOrder = await Order.findById(orderId);
  console.log("userOrder", userOrder);
  console.log("cartId", userOrder.cartId);

  return sendResponse(
    res,
    200,
    true,
    userOrder,
    null,
    "Update order successfully"
  );
});

module.exports = orderController;
