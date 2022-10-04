const Post = require('./posts.model');
const { successfulRes, failedRes } = require('../../utils/response');

exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          page_content: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }],
          page_info: [{ $count: 'total' }, { $addFields: { page: parseInt(page) } }],
        },
      },
    ]);
    return successfulRes(res, 200, posts);
  } catch (err) {
    return failedRes(res, 500, err);
  }
};

exports.getPost = async (req, res) => {
  const postId = req.params.post_id;
  try {
    const post = await Post.findById(postId).exec();
    if (!post || post.isDeleted) {
      return failedRes(res, 404, new Error(`Post[${post.title}] NOT found OR has been deleted`));
    }

    return successfulRes(res, 200, post);
  } catch (err) {
    return failedRes(res, 500, err);
  }
};

exports.addPost = async (req, res) => {
  const { _id: userId } = req.session.user;
  const { title, content } = req.body;

  try {
    const post = new Post({
      title,
      ownerId: userId,
      content,
    });
    await post.save();
    
    return successfulRes(res, 201, post);
  } catch (err) {
    if(err instanceof mongoose.Error.ValidationError)
      return failedRes(res, 422, err);
    return failedRes(res, 500, err);
  }
};

exports.updatePost = async (req, res) => {
  const { _id: userId } = req.session.user;
  const postId = req.params.post_id;
  const { title, content } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { title, ownerId: userId, content },
      { new: true, upsert: true }
    ).exec();

    return successfulRes(res, 200, post);
  } catch (e) {
    if(err instanceof mongoose.Error.ValidationError)
      return failedRes(res, 422, err);
    return failedRes(res, 500, e);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.post_id;
    const force = req.query.force;

    let response;
    if (force === 'true') {
      const post = await Post.findByIdAndDelete(postId).exec();
      response = `Post[${post.title}] has been deleted successfully with --FORCE Option`;
    } else {
      const post = await Post.findByIdAndUpdate(postId, { isDeleted: true }).exec();
      response = `Post[${post.title}] has been deleted successfully --SOFTLY`;
    }

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};
