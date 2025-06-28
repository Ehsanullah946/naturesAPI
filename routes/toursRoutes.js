const express = require('express');
const tourController = require('../controller/toureController');
const authController = require('../controller/authController');
const router = express.Router();

// router.param('id', tourController.CheckedID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlane, tourController.getAllTours);

router
  .route('/')
  .get(authController.protact, tourController.getAllTours)
  .post(tourController.createTour);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protact,
    authController.restrictTo('admin,lead-guid'),
    tourController.deleteTour,
  );

module.exports = router;
