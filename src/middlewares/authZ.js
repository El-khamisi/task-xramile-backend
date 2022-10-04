const Post = require('../services/posts/posts.model');
const { failedRes } = require('../utils/response');

exports.canUpdate = async (req, res, next) => {
  const user = req.session.user;
  const postId = req.params.post_id;

  Post.findById(postId)
    .then((doc) => {
      if (!doc) {
        return failedRes(res, 404, new Error(`Invalid Post ID[${postId}]`));
      } else if (doc.ownerId.toString() !== user._id.toString()) {
        return failedRes(res, 401, new Error(`You are NOT authorized to ${req.method} this post`));
      } else {
        next();
      }
    })
    .catch((err) => failedRes(res, 500, err));
};
