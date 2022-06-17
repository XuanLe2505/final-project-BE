const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY} = process.env;

const userSchema = Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: Number },
    address: { type: String },
    avatarUrl: { type: String },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Carts" },
    balance: { type: Number, default: 1000 },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.isDeleted;
  return obj;
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    { _id: this._id, role: this.role },
    JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return accessToken;
};

const User = mongoose.model("Users", userSchema);
module.exports = User;
