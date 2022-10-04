const jwt = require('jsonwebtoken');
const { TOKENWORD } = require('../config/env');
const User = require('../services/login/user.model');
const { failedRes } = require('../utils/response');

exports.authN = (req, res, next) => {
  if (!(req.get('Authorization') || req.cookies.authorization)) {
    return failedRes(res, 401, new Error('Login first'));
  }

  const token = req.get('Authorization')
    ? req.get('Authorization').split(' ')[1]
    : req.cookies.authorization;

  jwt.verify(token, TOKENWORD, (err, decoded) => {
    if (err) return failedRes(res, 401, err);

    // Add the session if doesn't exist
    const user = req.session.user;
    if (!user || !req.cookies.s_id || decoded._id.toString() !== user._id.toString()) {
      User.findById(decoded._id)
        .then((user) => {
          user.password = undefined;
          req.session.user = user.toObject();
          next();
        })
        .catch((err) => failedRes(res, 400, new Error(`Can NOT retrieve session || ${err}`)));
    } else {
      next();
    }
  });
};
