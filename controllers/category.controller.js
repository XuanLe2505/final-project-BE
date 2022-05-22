const { catchAsync, sendResponse, AppError } = require("../helpers/utilities");
const Category = require("../models/Category");

const categoryController = {};

//1. Admin can add new category
categoryController.addNewCategory = catchAsync(async (req, res, next) => {
  const { name, parent } = req.body;

  if (parent === null) {
    const checkCategory = await Category.findOne({ name });
    if (!checkCategory) {
      const category = await Category.create({
        name,
      });
      return sendResponse(
        res,
        200,
        true,
        category,
        null,
        "Add new category successfully"
      );
    }
  }

  const checkCategory = await Category.findOne({ parent, name });
  if (checkCategory)
    throw new AppError(404, "Category existed", "Create Category Error");

  const category = await Category.create({
    name,
    parent,
  });

  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Add new category successfully"
  );
});

// 2. User can see all categories
categoryController.getAllCategories = catchAsync(async (req, res, next) => {
  const filterCondition = [{ isDeleted: false }];

  const filterCritera = filterCondition.length ? { $and: filterCondition } : {};

  const categoriesList = await Category.find(filterCritera);

  return sendResponse(
    res,
    200,
    true,
    categoriesList,
    null,
    "get all categories successfully"
  );
});

module.exports = categoryController;
