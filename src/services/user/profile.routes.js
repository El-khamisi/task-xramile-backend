const router = require('express').Router();

const { getInstructors } = require('./user.controllers');
const { profileView, profileUpdate, profileDelete, enrollCourse } = require('./profile.controller');
const { authN } = require('../../middlewares/authN');

//Public instrucors
router.get('/instructors', getInstructors);

//Profile
router.get('/myprofile', authN, profileView);
router.put('/myprofile', authN, profileUpdate);
router.delete('/myprofile', authN, profileDelete);

router.post('/enroll/course/:course_id', authN, enrollCourse);

// router.post('/submit-quiz/:quiz_id', authN, submitQuiz);
// router.post('/enroll/spec/:spec_id', authN, enroll);
// router.post('/subscribe', authN, enroll);

// router.post('/pay', authN, payment);
// router.post('/paycb', paymentcb);
module.exports = router;
