const router = require('express').Router();

const { authN } = require('../../middlewares/authN');
const { isInstructor } = require('../../middlewares/authZ');
const { getUsers, getUser, addUser, updateUser, deleteUser } = require('./user.controllers');

//Users
router.get('/dashboard/users', authN, isInstructor, getUsers);
router.get('/dashboard/users/:id', authN, isInstructor, getUser);
router.post('/dashboard/users', authN, isInstructor, addUser);
router.put('/dashboard/users/:id', authN, isInstructor, updateUser);
router.delete('/dashboard/users/:id', authN, isInstructor, deleteUser);

module.exports = router;
