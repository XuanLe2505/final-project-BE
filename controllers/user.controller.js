const bcrypt = require("bcryptjs");
const { catchAsync, AppError, sendResponse } = require("../helpers/utilities");
const Cart = require("../models/Cart");
const User = require("../models/User");

const userController = {};

// 1. User can register account with role user
userController.userRegister = catchAsync(async (req, res, next) => {
  let { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    throw new AppError(409, "User already exists", "Register Error");
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user = await User.create({
    username,
    email,
    password,
  });

  const cart = await Cart.create({
    user: user._id,
    products: [],
  });

  user = await User.findByIdAndUpdate(
    user._id,
    { cart: cart._id },
    { new: true }
  ).populate("cart");

  const accessToken = user.generateAccessToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
});

// 2. Admin can register account with both role admin and user
userController.adminRegister = catchAsync(async (req, res, next) => {
  let { username, email, password, role } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    throw new AppError(409, "User already exists", "Register Error");
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  user = await User.create({
    username,
    email,
    password,
    role,
  });

  return sendResponse(res, 200, true, { user }, null, "Create user successful");
});

// 3. User can login by email and password of account
userController.loginEmailPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }, "+password").populate({
    path: "cart",
    populate: {
      path: "products.product",
      model: "Products",
    },
  });

  if (!user) {
    throw new AppError(400, "User not found", "Login Error");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(400, "Invalid credentials", "Login Error");
  }

  const accessToken = user.generateAccessToken();
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successful"
  );
});

//4. User can see information owners account
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;

  const user = await User.findById(currentUserId).populate({
    path: "cart",
    populate: {
      path: "products.product",
      model: "Products",
    },
  });

  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});
// userController.getAllUsers = catchAsync(async (req, res, next) => {
//   let { page, limit } = req.query;
//   page = parseInt(page) || 1;
//   limit = parseInt(limit) || 10;

//   const filterCondition = [{ isDeleted: false }];

//   const count = await User.countDocuments(filterCondition);
//   const totalPage = Math.ceil(count / limit);
//   const offset = limit * (page - 1);

//   let userList = await User.find(filterCondition)
//     .sort()
//     .skip(offset)
//     .limit(limit);

//   return sendResponse(res, 200, { userList, totalPage }, null, "successful");
// });

// //Create a review
// //Input :
//   //url correct?
//   //is user login ? => accessToken=> user_id, role
//   //req.body => {comment , rating, productId}
//   // Order.find({owner:userId})   => [productList1,productList2,productList3]
//   // productList : [x,y,z]

//   "target" ? [[a,b,c],[1,2,3],["x","y","z"]]

//   // if khong check condition =>
//   // Review.create(reviewer:user_id,comment , rating, productId)
//   // Product.findById(productId)
//     //tinh toan
//   // Product.save(productId,{averageRate:,numberComment:})

module.exports = userController;
