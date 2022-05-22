const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      require: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      require: true,
      enum: ["cash", "credit card"],
    },
    shipping: {
      address: { type: String, require: true },
      city: { type: String, require: true },
      country: { type: String, require: true },
      phone: { type: String, require: true },
    },
    status: {
      type: String,
      require: true,
      default: "pending",
      enum: ["pending", "confirm", "shipping", "done"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Orders", orderSchema);

module.exports = Order;
