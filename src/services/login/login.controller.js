const User = require('../user/user.model');
const Verification = require('./email-verification.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { successfulRes, failedRes } = require('../../utils/response');
const { setS_id } = require('../../utils/cookie');
const { NODE_ENV, TOKENKEY, to_email, server_domain, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require('../../config/env');
const { OAuth2Client } = require('google-auth-library');
const { smtpMail } = require('../../utils/smtp');

exports.regUser = async (req, res) => {
  try {
    let { first_name, last_name, email, password, phone } = req.body;

    const prev = await User.findOne({ email }).exec();
    if (prev) return failedRes(res, 400, new Error('You already have an account'));

    if (email && password) {
      password = bcrypt.hashSync(password, 10);
    } else {
      throw new Error('Email and password are REQUIRED');
    }
    let saved = new User({ first_name, last_name, email, password, phone });
    await saved.save();

    const token = saved.generateToken(req, res);

    saved.password = undefined;
    req.session.user = saved.toObject();

    const user = {
      id: saved._id,
      name: `${saved.first_name} ${saved.last_name}`,
      photo: saved.photo,
      email: saved.email,
      is_verified: saved.is_verified,
      role: saved.role,
    };

    // setS_id(req, res);

    //
    const hash = crypto.createHmac('sha256', TOKENKEY).update(saved._id.toString()).digest('hex');
    const verification = new Verification({ verification_hash: hash, user_id: saved._id });
    await verification.save();
    const info = await smtpMail(
      saved.email,
      'textgenuss',
      to_email,
      'textgenuss email verification',
      `Hello ${saved.first_name} ${saved.last_name},
    You requested to use this email address to access your Shuhyb Academy account.
    Click the link below to verify this email address
    ${server_domain}/email-confirmation/${verification.verification_hash}`
    );
    return successfulRes(res, 201, { user, token, email_verifiction: info.response });
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.logUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return failedRes(res, 400, new Error('Email and password are REQUIRED'));
  }

  try {
    let logged = await User.findOne({
      email,
    }).exec();

    if (!logged) {
      return failedRes(res, 400, new Error('Email is invalid'));
    }

    const matched = bcrypt.compareSync(password, logged.password);
    logged.password = undefined;
    if (!logged || !matched) {
      return failedRes(res, 400, new Error('Email or Password is invalid'));
    } else {
      const token = logged.generateToken(req, res);

      req.session.user = logged.toObject();

      const user = {
        id: logged._id,
        name: `${logged.first_name} ${logged.last_name}`,
        photo: logged.photo,
        email: logged.email,
        is_verified: logged.is_verified,
        role: logged.role,
      };

      // setS_id(req, res);
      return successfulRes(res, 200, { user, token });
    }
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy(() => {});
    // const session = MongoStore.create({ client: mongoose.connection.getClient() });
    // session.destroy(req.sessionID);

    res.cookie('authorization', '', {
      sameSite: NODE_ENV == 'dev' ? false : 'none',
      secure: NODE_ENV == 'dev' ? false : true,
    });

    res.cookie('s_id', '', {
      sameSite: NODE_ENV == 'dev' ? false : 'none',
      secure: NODE_ENV == 'dev' ? false : true,
    });

    return successfulRes(res, 200, 'You have been logged out successfully');
  } catch (err) {
    return failedRes(res, 500, 'Invalid logout operation');
  }
};

exports.resetPassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const user_id = req.session.user._id;
  try {
    const user = await User.findById(user_id).exec();
    if (!user) {
      return failedRes(res, 400, new Error('User not found'));
    }
    const matched = bcrypt.compareSync(current_password, user.password);
    if (!matched) {
      return failedRes(res, 400, new Error('Current password is invalid'));
    } else {
      user.password = bcrypt.hashSync(new_password, 10);
      await user.save();
      return successfulRes(res, 200, 'Password has been changed successfully');
    }
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return successfulRes(res, 200, { payload, userid });
};

exports.reverifyEmail = async (req, res) => {
  try {
    const user = req.session;

    const hash = crypto.createHmac('sha256', TOKENKEY).update(user._id.toString()).digest('hex');
    const verification = new Verification({ verification_hash: hash, user_id: user._id });
    await verification.save();
    const info = await smtpMail(
      user.email,
      'textgenuss',
      to_email,
      'textgenuss email verification',
      `Hello ${user.first_name} ${user.last_name},
 You requested to use this email address to access your Shuhyb Academy account.
 Click the link below to verify this email address
 ${server_domain}/email-confirmation/${verification.verification_hash}`
    );

    return successfulRes(res, 201, { email_verifiction: info.response });
  } catch (e) {
    return failedRes(res, 500, e);
  }
};
