const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Helpful indexes for these pipelines
postSchema.index({ status: 1, tags: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ status: 1, authorId: 1 });

module.exports = mongoose.model('Post', postSchema);