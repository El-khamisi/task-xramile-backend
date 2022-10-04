const { failedRes } = require('../utils/response');

exports.isMine = async (req, res, next) => {
  try {
    const user = req.session.user;
    const postId = req.params.post_id;

    const userPost = user.posts.find((e) => e === postId);
    if (!userPost) {
      return failedRes(res, 401, new Error(`You are NOT authorized to ${req.method} this post`));
    }

    next();
  } catch (err) {
    return failedRes(res, 500, err);
  }
};
