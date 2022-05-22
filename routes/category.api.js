const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validator");
const { loginRequired, isAdmin } = require("../middlewares/auth");
const {
  addNewCategory,
  deleteCategory,
  getAllCategories,
  getAllSubcategories,
} = require("../controllers/category.controller");

/**
 * @route POST /category
 * @description Admin add a new category
 * @access Login required, role admin
 */
router.post(
  "/admin/addNewCategory",
  loginRequired,
  isAdmin,
  validate([body("name", "Invalid name").exists().notEmpty()]),
  addNewCategory
);

/**
 * @route Get /categories
 * @description User can see categories
 * @access publish
 */
router.get("/categories", getAllCategories);

module.exports = router;
