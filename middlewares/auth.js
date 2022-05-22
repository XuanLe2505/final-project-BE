const jwt = require("jsonwebtoken");
const { AppError } = require("../helpers/utilities");
const { checkObjectId } = require("./validator");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new AppError(401, "Token is Missing", "Login Require Error");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        throw new AppError(403, "Token is not valid", "Login Require Error");
      }
      checkObjectId(payload._id);
      req.currentUserId = payload._id; // user's id
      req.currentRole = payload.role; // user's role
    });
    next();
  } catch (error) {
    next(error);
  }
};

authMiddleware.isUser = async (req, res, next) => {
  const { currentRole } = req;
  if (currentRole === "user") {
    return next();
  }
  throw new AppError(401, "Unauthorized", "Bad request");
};

authMiddleware.isAdmin = async (req, res, next) => {
  const { currentRole } = req;
  if (currentRole === "admin") {
    return next();
  }
  throw new AppError(401, "Unauthorized", "Bad request");
};

module.exports = authMiddleware;
