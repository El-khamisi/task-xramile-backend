const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// configuration
const { TOKENWORD } = require('../../config/env');
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: [true, 'name is required'] },
    email: {
      type: String,
      trim: true,
      required: [true, 'email is required'],
      unique: true,
      validate: { validator: validator.isEmail, message: 'Invalid Email' },
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      validate: { validator: validator.isStrongPassword, message: 'week password' },
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => validator.isMobilePhone(v, 'any', { strictMode: true }),
        message: 'Invalid phone number',
      },
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'ownerId',
});

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      phone: this.phone,
    },
    TOKENWORD,
    { expiresIn: '14d' }
  );

  return token;
};

// Exclude findOne for Login password
userSchema.post(['save', 'find', 'findByIdAndUpdate', 'findByIdAndDelete'], function (doc, next) {
  if (!doc) {
    next();
  } else if (doc.length && doc.length > 0) {
    doc.forEach((e, i) => {
      doc[i].password = undefined;
    });
  } else {
    doc.password = undefined;
  }
  next();
});

module.exports = mongoose.model('User', userSchema, 'User');
