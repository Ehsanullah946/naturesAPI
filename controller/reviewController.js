const Review = require('../model/reviewModel');
const catchAsynch = require('../utils/catchAsynch');
const factory = require('./handlerFactory');

exports.getAllReview = catchAsynch(async (req, res, next) => {
  //.....................
  // this part of code will finde all the reviews that belongs to the tour that specify the id in the ulr
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  //...........................................................

  const review = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: review,
  });
});

//this is a middleware that befor creating a new review it will preform
exports.setTourUserIds = (req, res, next) => {
  // .............................................................................
  //this part of code handle to create reviews based on the tourId that comes from the url
  // and the user that based on the user that loged in
  // for example tour/32492832kdfas/reviews   and this will be merge with tour router
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
  ///....................................................................................
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.deleteReview = catchAsynch(async (req, res, next) => {
//   const review = await Review.findByIdAndDelete(req.params.id);
//   try {
//     res.status(204).json({
//       status: 'success',
//       data: {
//         review,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'faild',
//       message: 'some error accurd',
//     });
//   }
// });
