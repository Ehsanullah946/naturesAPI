const Tour = require('../model/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsynch');
const factory = require('./handlerFactory');
// exports.getAllTours = async (req, res) => {
//   try {
//     // filltring

//     //http://localhost:3000/api/v1/tours?difficulty=easy&page=2&sort=1&limits=10
//     const queryObj = { ...req.query };
//     const excludFields = ['page', 'sort', 'limits', 'field'];
//     excludFields.forEach((el) => delete queryObj[el]);

//     // Advanced filltring
//     //  http://localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5

//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     console.log(JSON.parse(queryStr));

//     const query = Tour.find(JSON.parse(queryStr));

//     //1- sorting

//     if (req.query.sort) {
//       query = query.sort(req.query.sort);
//     }

//     // const query = Tour.find(queryObj);
//     const tours = await query;
//     res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'faild',
//       message: 'some error accurd',
//     });
//   }
// };

exports.aliasTopTour = (req, res, next) => {
  req.url =
    '/api/v1/tours?limit=5&sort=price&fields=name,price,summary,ratingsAverage,difficulty';
  next();
};
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = async (req, res) => {
//   try {
// 1. Basic filtering
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// // 2. Advanced filtering
// //  http://localhost:3000/api/v1/tours?duration[gt]=5&difficulty=easy
// const filter = {};
// for (let key in queryObj) {
//   if (key.includes('[')) {
//     // e.g. duration[gte] => key = "duration[gte]"
//     const parts = key.split('[');
//     const field = parts[0]; // duration
//     const operator = parts[1].replace(']', ''); // gte

//     if (!filter[field]) filter[field] = {};
//     filter[field][`$${operator}`] = Number(queryObj[key]);
//   } else {
//     filter[key] = queryObj[key];
//   }
// }

// // 3. Build the query
// let query = Tour.find(filter);

// 4. Sorting
//http://localhost:3000/api/v1/tours?sort=price

// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

// 5. advanced fields
// http://localhost:3000/api/v1/tours?fields=name

// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__V');
// }

// 6. pagenation
//

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours)
//     throw new Error('the number of skip greather than number of thours');
// }
// 5. Execute the query

//   const features = new APIFeatures(Tour.find(), req.query)
//     .Filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;

//   // 6. Send response
//   res.status(200).json({
//     status: 'success',
//     data: { tours },
//   });
// } catch (error) {
//   console.error('Error:', error.message);
//   res.status(500).json({
//     status: 'failed',
//     message: 'Something went wrong.',
//   });
// }
// };

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('the tour not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.createTour = factory.createOne(Tour);

//without catchAsynch function that prevent the try catch repeating

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      // {
      //   $match: { ratingsAverage: { $gte: 4.6 } },
      // },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    console.log('Stats:', stats);
    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlane = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $project: { _id: 0 },
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'faild',
      message: 'some error accurd',
    });
  }
};
// tours-within/233/center/-43,42/unit/mi
exports.getTourWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(new AppError('please provide lantitute and langitue.', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSpere: [[lng, lat], radius] } },
  });

  console.log(distance, lat, lng);
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
};
