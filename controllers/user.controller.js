const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../helpers/sendEmail");
const {
  catchAsync,
  AppError,
  sendResponse,
  createActivationToken,
} = require("../helpers/utilities");
const cloudinary = require("../helpers/cloudinary");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { google } = require("googleapis");
const fetch = require("node-fetch");
const { OAuth2 } = google.auth;
const { CLIENT_URL } = process.env;
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const userController = {};

// 1. User can register account with role user
userController.register = catchAsync(async (req, res, next) => {
  let { username, email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw new AppError(409, "User already exists", "Register Error");
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  const newUser = {
    username,
    email,
    password,
  };
  const activationToken = createActivationToken(newUser);

  const url = `${CLIENT_URL}/user/activate/${activationToken}`;
  sendEmail(email, url, "Verify your email address");

  return sendResponse(
    res,
    200,
    true,
    {},
    null,
    "Register Success! Please activate your email to start."
  );
});

// 2. User activate email
userController.activateEmail = catchAsync(async (req, res, next) => {
  const { activationToken } = req.body;

  const userInfo = jwt.verify(
    activationToken,
    process.env.ACTIVATION_TOKEN_SECRET_KEY
  );

  const { username, email, password } = userInfo;

  let user = await User.create({
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
    "Activation Email Success!"
  );
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
// 4. User can login with google account
userController.googleLogin = catchAsync(async (req, res, next) => {
  const { tokenId } = req.body;

  const verify = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.MAILING_SERVICE_CLIENT_ID,
  });

  const { email_verified, email, name, picture } = verify.payload;

  const password = email + process.env.GOOGLE_SECRET;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (!email_verified) {
    throw new AppError(400, "Email verification failed.", "Login Error");
  }

  const user = await User.findOne({ email }, "+password").populate({
    path: "cart",
    populate: {
      path: "products.product",
      model: "Products",
    },
  });

  if (user) {
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
  } else {
    let user = await User.create({
      username: name,
      email,
      password: passwordHash,
      avatarUrl: picture,
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
      "Login successful!"
    );
  }
});
// 5. User can login with facebook account
userController.facebookLogin = catchAsync(async (req, res, next) => {
  const { accessToken, userID } = req.body;

  const URL = `https://graph.facebook.com/v4.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;

  const response = await fetch(URL);
  const data = await response.json();

  const { email, name, picture } = data;

  const password = email + process.env.FACEBOOK_SECRET;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.findOne({ email }, "+password").populate({
    path: "cart",
    populate: {
      path: "products.product",
      model: "Products",
    },
  });

  if (user) {
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
  } else {
    let user = await User.create({
      username: name,
      email,
      password: passwordHash,
      avatarUrl: picture.data.url,
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
      "Login successful!"
    );
  }
});

// 6. Forgot password
userController.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(500, "This email does not exist", "Register Error");
  }
  const accessToken = user.generateAccessToken();
  const url = `${CLIENT_URL}/user/reset/${accessToken}`;
  sendEmail(email, url, "Reset your password");

  return sendResponse(
    res,
    200,
    true,
    {},
    null,
    "Re-send the password, please check your email."
  );
});
// 7. Reset password
userController.resetPassword = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;
  let { password } = req.body;

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  const user = await User.findByIdAndUpdate(currentUserId, {
    password: password,
  });

  return sendResponse(
    res,
    200,
    true,
    {},
    null,
    "Password successfully changed!"
  );
});

// 8. User can see information owner account
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

// 9. User can upload image
userController.uploadImage = catchAsync(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  return sendResponse(
    res,
    200,
    true,
    result.secure_url,
    null,
    "Upload image successfully"
  );
});
// 10. User can update information owner account
userController.updateProfileUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.currentUserId;

  let user = await User.findByIdAndUpdate(currentUserId);

  const allow = ["username", "phone", "address", "avatarUrl"];
  allow.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  user = await user.save();

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update user's profile successfully"
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
