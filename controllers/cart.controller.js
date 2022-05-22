const { catchAsync, sendResponse, AppError } = require("../helpers/utilities");
const Cart = require("../models/Cart");

const cartController = {};

//everytime cart change this api is call
//Front end send total cart product
cartController.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.currentUserId;
  let { cartProducts } = req.body;

  let cart = await Cart.findOne({ user: userId }).populate("user");

  if (!cart) throw new AppError(400, "Cart Not Found", "Add to Cart Error");

  cart.products = cartProducts.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
  }));

  console.log("cart", cart);

  cart = await cart.save().then((r) => r.populate("products.product"));

  return sendResponse(
    res,
    200,
    true,
    cart,
    null,
    "Add product to cart successfully"
  );
});

module.exports = cartController;
