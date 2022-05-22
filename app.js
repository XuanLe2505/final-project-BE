require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const { sendResponse } = require("./helpers/utilities");
const mongoURI = process.env.MONGO_DEV_URI;

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

/* Database Connection */
mongoose
  .connect(mongoURI)
  .then(() => console.log(`Connected to MongoDB`))
  .catch((err) => console.log(err));

app.use('/v1', indexRouter);

// catch 404 error and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Not found");
    err.statusCode = 404;
    next(err);
});

// initialize Error Handling
app.use((err, req, res, next) => {
    console.log("Error", err);
    if (err.isOperational) {
      return sendResponse(
        res,
        err.statusCode ? err.statusCode : 500,
        false,
        null,
        { message: err.message },
        err.errorType
      );
    } else {
      return sendResponse(
        res,
        err.statusCode ? err.statusCode : 500,
        false,
        null,
        { message: err.message },
        "Internal Server Error"
      );
    }
});


module.exports = app;
