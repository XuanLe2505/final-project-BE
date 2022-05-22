const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
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
});

const Cart = mongoose.model("Carts", cartSchema);

module.exports = Cart;
