const catchAsynch = require('../utils/catchAsynch');
const Tour = require('../model/tourModel');
const Reviews = require('../model/reviewModel');

exports.getOverview = catchAsynch(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsynch(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).render('tour', {
    title: 'the forest hiker',
    tour,
  });
});
