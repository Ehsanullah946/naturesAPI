const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userModel');
const catchAsynch = require('./../utils/catchAsynch');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');

// the function that generate the token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // creating cookie and send to the user

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  // remove password from the output
  user.password = undefined;

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'successfully',
    token,
    data: {
      user: user,
    },
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

  createSendToken(newUser, 201, res);
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

  createSendToken(user, 200, res);
});

exports.protect = catchAsynch(async (req, res, next) => {
  // take the token from the header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('you are not access to this page or data', 401));
  }

  try {
    //2. varification token
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
  } catch (err) {
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
  await user.save({ validateBeforeSave: false });

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
    console.error('EMAIL ERROR:', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new AppError('your email did not send please try again', 500));
  }
});

exports.resetPassword = catchAsynch(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('Incoming plain token:', req.params.token);
  console.log('Hashed token:', hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not exprired and there is user set the password

  if (!user) {
    return next(new AppError('token is invalid has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  console.log('Hashed Token:', hashedToken);
  console.log('User from DB:', await User.findOne({}));

  // update changePassword property for the user

  // log user in send jwt

  createSendToken(user, 200, res);
});

exports.updatePassword = async (req, res, next) => {
  try {
    // 1. Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 2. Check if POSTed current password is correct
    const correct = await user.correctPassword(
      req.body.passwordCurrent,
      user.password,
    );

    if (!correct) {
      return next(new AppError('Your current password is wrong', 401));
    }

    // 3. If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save(); // ✅ Save updated password

    // 4. Log user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(err);
  }
};
