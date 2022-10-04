const router = require('express').Router();

const { authN } = require('../../../middlewares/authN');
const { canUpdate } = require('../../../middlewares/authZ');
const { getPosts, getPost, addPost, updatePost, deletePost } = require('./posts.controller');

// Public Routes
router.get('/posts', getPosts);
router.get('/posts/:post_id', getPost);

router.post('/posts', authN, addPost);
router.put('/posts/:post_id', authN, canUpdate, updatePost);
router.delete('/posts/:post_id', authN, canUpdate, deletePost);
module.exports = router;
