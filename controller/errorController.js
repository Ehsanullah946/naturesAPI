const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
const handleDupicateErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} please enter another value`;
  return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.value(err.errors).map((el) => el.message);
  const message = `invalid input ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const handleJsonwebtokenError = (err) =>
  new AppError('the token is invalid please loged in again', 401);

const handleTokenExpiredError = (err) =>
  new AppError('the token is expired please loged in again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).render('error', {
    titile: 'something went worng',
    msg: err.message,
  });
};

const sendErrorPro = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      titile: 'something went worng',
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render('error', {
    titile: 'something went worng',
    msg: 'please try again latter',
  });
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    err.message = { ...err };
    err.message = err.message;
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDupicateErrorDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJsonwebtokenError(err);
    if (err.name === 'TokenExpiredError') err = handleTokenExpiredError(err);
    sendErrorPro(err, req, res);
  }
};
