const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .patch(authController.protect, reviewController.updateReview)
  .get(reviewController.getReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = router;
