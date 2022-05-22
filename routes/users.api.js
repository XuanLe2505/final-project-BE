const express = require("express");
const router = express.Router();
const {
  loginEmailPassword,
  userRegister,
  adminRegister,
  getCurrentUser,
} = require("../controllers/user.controller");
const { body, param, header } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isAdmin } = require("../middlewares/auth");

/**
 * @description: User create an account by email
 * @access: Public
 * @method: POST
 * @param: body: {username, email, password, role: user(default)}
 */
router.post(
  "/user/register",
  validate([
    body("username", "Invalid username").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userRegister
);

/**
 * @description: Create an admin account by email
 * @access: Public
 * @method: POST
 * @param: body: {username, email, password, role: admin}
 */
router.post(
  "/admin/register",
  loginRequired,
  isAdmin,
  validate([
    body("username", "Invalid username").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
    body("role", "Not role admin").exists().notEmpty(),
  ]),
  adminRegister
);

router.post(
  "/login",
  validate([
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  loginEmailPassword
);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/users/me", loginRequired, getCurrentUser);

module.exports = router;
