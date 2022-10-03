const router = require('express').Router();
const { logUser, regUser, logout, resetPassword, reverifyEmail } = require('./login.controller');
const { authN } = require('../../middlewares/authN');
const { emailVerification } = require('./email-verification.controller');
const { successfulRes } = require('../../utils/response');

router.post('/login', logUser);
router.post('/signup', regUser);
router.post('/logout', logout);
router.put('/reset-password', authN, resetPassword);
router.get('/email-confirmation/:hash', emailVerification);
router.post('/email-verification', authN, reverifyEmail);

//Login-with google
router.post('/login/google');

router.get('/login/google');
router.get('/google/cb');

//Login-with facebook
// router.get();

module.exports = router;
