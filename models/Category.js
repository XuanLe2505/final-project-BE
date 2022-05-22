const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = Schema(
  {
    name: { type: String, require: true, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
    },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Categories", categorySchema);

module.exports = Category;
