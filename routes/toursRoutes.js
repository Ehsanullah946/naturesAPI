const express = require('express');
const tourController = require('../controller/toureController');
const authController = require('../controller/authController');
const router = express.Router();
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./ReviewRoutes');

// router.param('id', tourController.CheckedID);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

// tour/

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlane,
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
// tours-within/233/-43,42/unit/mi

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.createTour,
  );

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.deleteTour,
  );

module.exports = router;
