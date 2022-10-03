const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');

//configuration
const { TOKENKEY, NODE_ENV } = require('../../config/env');
const roles = require('../../config/roles');
const { subscriptions } = require('../../config/public_config');

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, trim: true, required: true },
    last_name: { type: String, trim: true },
    email: { type: String, trim: true, required: [true, 'Email is required'], unique: true, validate: [validator.isEmail, 'Invalid Email'] },
    phone: { type: String },
    password: { type: String, required: [true, 'Password is required'] },
    is_verified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(roles), default: roles.Student },
    description: { type: String, trim: true },
    specialist: { type: [String] },
    rating: {
      _id: false,
      total_rate: { type: Number, default: 0 },
      total_users: { type: Number, set: (v) => Math.round(v * 10) / 10, default: 0.0 },
    },
    photo: { type: String, default: 'https://shuhyb.s3.wasabisys.com/photos/user.jpg-1662569995644.jpg' },
    courses: [
      {
        course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        lessons: [
          {
            _id: { type: mongoose.Schema.Types.ObjectId, refPath: 'courses.lessons.type' },
            type: {
              type: String,
              enum: ['Lesson', 'Quiz'],
            },
            status: { type: String, enum: ['notStarted', 'pending', 'passed'], default: 'notStarted' },
          },
        ],
        is_completed: { type: Boolean, default: false },
        total_mark: { type: Number, default: 0 },
        subscription: {
          _id: false,
          status: { type: String, enum: ['approved', 'pending', 'failed'], default: 'pending' },
          type: { type: String, enum: Object.values(subscriptions), require: true },
          expires_at: Date,
        },
        remaining_cost: { type: Number, set: (v) => Math.round(v * 100) / 100, default: 0.0 },
        payment_type: { type: String, enum: ['cash payment', 'online payment'], required: true },
        installment_months: { type: Number, default: 0 },
      },
    ],
    specs: [
      {
        spec_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Spec', required: true },
        courses: [mongoose.Schema.Types.ObjectId],
        is_completed: { type: Boolean, default: false },
        total_mark: { type: Number, default: 0 },
        subscription: {
          _id: false,
          status: { type: String, enum: ['approved', 'pending', 'failed'], default: 'pending' },
          type: { type: String, enum: Object.values(subscriptions), require: true },
          expires_at: Date,
        },
        remaining_cost: { type: Number, set: (v) => Math.round(v * 100) / 100, default: 0.0 },
        payment_type: { type: String, enum: ['cash payment', 'online payment'], required: true },
        installment_months: { type: Number, default: 0 },
      },
    ],
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function (req, res) {
  const token = jwt.sign(
    {
      id: this._id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      photo: this.photo,
      phone: this.phone,
      role: this.role,
      is_verified: this.is_verified,
    },
    TOKENKEY,
    { expiresIn: '14d' }
  );

  return token;
};

//Exclude findOne for Login password
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

module.exports = mongoose.model('User', userSchema);
