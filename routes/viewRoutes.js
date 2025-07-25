const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.isLogedin);

router.get('/tour/:slug', viewController.getTour);
router.get('/', viewController.getOverview);
router.get('/login', viewController.getLoginForm);

module.exports = router;
