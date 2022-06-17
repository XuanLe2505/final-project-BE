const express = require("express");
const router = express.Router();
const {
  loginEmailPassword,
  register,
  getCurrentUser,
  activateEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
  updateProfileUser,
  uploadImage,
} = require("../controllers/user.controller");
const { body, param, header } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isAdmin } = require("../middlewares/auth");
const upload = require("../helpers/multer");

/**
 * @route POST /users
 * @description: User send info an account by email
 * @access: Public
 */
router.post(
  "/register",
  validate([
    body("username", "Invalid username").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  register
);

/**
 * @route POST /users
 * @description Create user's account with info registered
 * @access Public
 */
router.post("/activation", activateEmail);

/**
 * @route POST /users
 * @description User login by account which has been registered
 * @access Public
 */
router.post(
  "/login",
  validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  loginEmailPassword
);
/**
 * @route POST /users
 * @description User login by google account
 * @access Public
 */
router.post("/googleLogin", googleLogin);
/**
 * @route POST /users
 * @description User login by facebook account
 * @access Public
 */
router.post("/facebookLogin", facebookLogin);
/**
 * @route POST /users
 * @description User verify forgot password by email
 * @access Public
 */
router.post(
  "/forgot",
  validate([body("email", "Invalid email").exists().isEmail()]),
  forgotPassword
);
/**
 * @route POST /users
 * @description User reset password
 * @access Public
 */
router.post(
  "/reset",
  validate([body("password", "Invalid password").exists().notEmpty()]),
  loginRequired,
  resetPassword
);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", loginRequired, getCurrentUser);
/**
 * @route POST /user/uploadImage
 * @description User can upload image
 * @access Login required
 */
router.post(
  "/uploadImage",
  loginRequired,
  upload.single("image"),
  uploadImage
);
/**
 * @route PUT /user/updateProfile
 * @description Update user info
 * @access Login required
 */
router.put(
  "/updateProfile",
  loginRequired,
  updateProfileUser
);

module.exports = router;
