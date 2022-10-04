const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: [true, "post's title is required"] },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    content: { type: String },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema, 'Post');
