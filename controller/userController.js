const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsynch = require('../utils/catchAsynch');

const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(Obj).forEach((element) => {
    if (allowedFields.includes(element)) newObj[element] = Obj[element];
  });
  return newObj;
};

exports.getAllUsers = catchAsynch(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});

exports.updateMe = catchAsynch(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }
  // filter out unwanted fields name that not allowed  to be updated
  const filterBody = filterObj(req.body, 'name', 'email');
  // update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsynch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'fialed',
    message: 'this route is not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fialed',
    message: 'this route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'fialed',
    message: 'this route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'fialed',
    message: 'this route is not yet defined',
  });
};
