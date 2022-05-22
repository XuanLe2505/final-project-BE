const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "Users" },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Products" },
  },
  {
    timestamps: true,
  }
);

const productSchema = Schema(
  {
    name: { type: String, require: true, unique: true },
    productCode: { type: String, require: true },
    image: { type: String, require: true },
    cloudinary_id: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    countInStock: { type: Number, require: true },
    averageRating: { type: Number, default: 0 },
    numberReviews: { type: Number, default: 0},
    discount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, //CreatedAt & UpdatedAt
  }
);

const Product = mongoose.model("Products", productSchema);

const Review = mongoose.model("Reviews", reviewSchema);

module.exports = Product;
