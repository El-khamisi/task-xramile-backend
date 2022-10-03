const jwt = require('jsonwebtoken');
const { TOKENKEY } = require('../config/env');
const User = require('../services/user/user.model');
const { failedRes } = require('../utils/response');

exports.authN = (req, res, next) => {
  if (!(req.get('Authorization') || req.cookies.authorization)) {
    return failedRes(res, 401, new Error('Login first'));
  }

  const token = req.get('Authorization') ? req.get('Authorization').split(' ')[1] : req.cookies.authorization;

  jwt.verify(token, TOKENKEY, (err, decoded) => {
    if (err) return failedRes(res, 401, err);

    const user = req.session.user;
    if (!user || !req.cookies.s_id) {
      console.log('Can not find session')
      User.findById(decoded.id)
        .then((user) => {
          user.password = undefined;
          req.session.user = user.toObject();
          return next();
        })
        .catch((err) => failedRes(res, 400, new Error(`Can NOT retrieve session || ${err}`)));
    } else {
      next();
    }
  });
};
