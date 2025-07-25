const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// this is a middleware that can protect all route that comes afeter this middleware and has the authController
router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

router.patch(
  '/updateMyPassword',

  authController.updatePassword,
);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
