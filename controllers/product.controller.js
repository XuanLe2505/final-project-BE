const cloudinary = require("../helpers/cloudinary");
const { catchAsync, sendResponse, AppError } = require("../helpers/utilities");
const Category = require("../models/Category");
const Product = require("../models/Product");

const productController = {};

//1. Admin can add new product
productController.addNewProduct = catchAsync(async (req, res, next) => {
  const {
    name,
    productCode,
    category,
    subcategory,
    description,
    price,
    countInStock,
    discount,
  } = req.body;

  // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path);
  console.log(result);

  let product = await Product.create({
    name,
    productCode,
    category,
    subcategory,
    description,
    image: result.secure_url,
    cloudinary_id: result.public_id,
    price,
    countInStock,
    discount,
  });

  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Add new product successfully"
  );
});

//2. Admin can update information of product
productController.updateInfoProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  let product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, "Product not found", "Update Product Error");
  }

  const allow = [
    "name",
    "productCode",
    "category",
    "description",
    "price",
    "countInStock",
    "discount",
  ];
  allow.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  product = await product.save();

  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Update information of product successfully"
  );
});

//3. Admin can delete product
productController.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  let product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw new AppError(404, "Product not found", "Delete Product Error");
  }
  product.isDeleted = true;
  product = await product.save();

  return sendResponse(res, 200, true, {}, null, "Delete product successfully");
});

// 4. User can see all product with pagination
productController.getAllProducts = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 12;

  const filterCondition = [{ isDeleted: false }];

  if (filter["category"]) {
    const category = await Category.findOne({ name: filter["category"] });
    let subCategories = await Category.find({ parent: category._id });
    subCategories = subCategories.map((category) => category._id);
    filterCondition.push({
      category: { $in: subCategories },
    });
  }

  const filterCritera = filterCondition.length ? { $and: filterCondition } : {};

  const countProduct = await Product.countDocuments(filterCritera);
  const totalPage = Math.ceil(countProduct / limit);
  const offset = limit * (page - 1);
  const productsList = await Product.find(filterCritera)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { productsList, currentPage: page, countProduct, totalPage },
    null,
    "get all products successfully"
  );
});

// 5. User can see detail of product
productController.getSingleProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    throw new AppError(404, "product not found", "Get single product error");
  }
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    `Get detail product with productId ${productId} successfully`
  );
});

module.exports = productController;
