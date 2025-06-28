const User = require('../model/userModel');
const catchAsynch = require('../utils/catchAsynch');

exports.getAllUsers = catchAsynch(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: { users },
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
