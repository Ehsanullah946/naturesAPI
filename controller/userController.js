const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsynch = require('../utils/catchAsynch');
const factory = require('./handlerFactory');

const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(Obj).forEach((element) => {
    if (allowedFields.includes(element)) newObj[element] = Obj[element];
  });
  return newObj;
};

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

exports.getMe = (req, res, next) => {
  // this line of code change the req.params.id into req.user.id which is the current user that loged in
  req.params.id = req.user.id;
  next();
};

//Do not update password with this
exports.updateUser = factory.updateOne(User);

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
