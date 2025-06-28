const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsynch = require('./../utils/catchAsynch');
const AppError = require('../utils/appError');
const AppError = require('../utils/email');
const { promisify } = require('util');
const sendEmail = require('../utils/email');

// the function that generate the token
exports.signuptoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsynch(async (req, res) => {
  // create new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // calling the function that generate the token
  const token = this.signuptoken(newUser._id);
  res.status(201).json({
    status: 'successfully',
    token,
    data: {
      user: newUser,
    },
  });
});

// login part when user login
exports.login = catchAsynch(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email or password is empty
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // a query find the email and password from user and select them
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('The email or password is not correct', 404));
  }

  const token = this.signuptoken(user._id); // call the function directly

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protact = catchAsynch(async (req, res, next) => {
  // take the token from the header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('you are not access to this page or data', 401));
  }

  try {
    //2. varification toekn
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3. check if the user still exist
    const currentUser = await User.findById(decode.id);
    if (!currentUser) {
      return next(new AppError('The user no longer exists.', 401));
    }
    if (currentUser.changePasswordAfter(decode.iat)) {
      return next(new AppError('User recently changed the password', 401));
    }
    req.user = currentUser;
    next();
  } catch {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError('Your token has expired. Please log in again.', 401),
      );
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    return next(err);
  }
});

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('you do not have premision to preform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsynch(async (req, res, next) => {
  //1. find user by his email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('this user has not found', 404));
  }

  // 2. generate the random reset token

  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // 3.send it to user email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? submit patch request with your new password and password confirm to 
    ${resetURL}\n if you do not foget your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'you have 10 minit to confirm this password',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token send to the  email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    return next(new AppError('you email did not send please try again', 500));
  }
});
exports.resetPassword = (req, res, next) => {};
