const cloudinary = require("../helpers/cloudinary");
const { catchAsync, sendResponse, AppError } = require("../helpers/utilities");
const { collection } = require("../models/Category");
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
  let { page, limit, search, sortBy, category } = req.query;
  console.log(sortBy);
  const arrSort = sortBy.split(".");
  sortBy = arrSort[0];
  const sortOrder = arrSort[1];
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 12;

  const options = [{ $match: { isDeleted: false } }];

  if (category) {
    const categoryName = await Category.findOne({ name: category });
    if (categoryName.parent === null) {
      let subCategories = await Category.find({ parent: categoryName._id });
      subCategories = subCategories.map((category) => category._id);
      options.push({
        $match: {
          category: { $in: subCategories },
        },
      });
    } else {
      options.push({
        $match: {
          category: categoryName._id,
        },
      });
    }
  }

  if (search && search !== "") {
    options.push({
      $match: {
        $or: [{ name: { $regex: search, $options: "i" } }],
      },
    });
  } else {
    delete search;
  }

  if (sortBy && sortOrder) {
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    options.push({
      $sort: sort,
    });
  } else {
    options.push({
      $sort: { createdAt: -1 },
    });
  }

  const offset = limit * (page - 1);
  options.push({
    $facet: {
      total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      pagination: [{ $skip: offset }, { $limit: limit }],
    },
  });

  const products = await Product.aggregate(options);

  const totalProducts = products[0] ? products[0].total[0].count : 0;
  const totalPage = Math.ceil(totalProducts / limit);

  return sendResponse(
    res,
    200,
    true,
    { products: products[0].pagination, totalProducts, currentPage: page, totalPage },
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
