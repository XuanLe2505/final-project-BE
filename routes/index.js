const express = require("express");
const router = express.Router();

const userRoutes = require("./users.api");
router.use("/", userRoutes);

const productRoutes = require("./products.api");
router.use("/", productRoutes);

const cartRoutes = require("./cart.api");
router.use("/", cartRoutes);

const categoryRoutes = require("./category.api");
router.use("/", categoryRoutes);

const orderRoutes = require("./order.api");
router.use("/", orderRoutes);

module.exports = router;
