const Post = require('../models/post.model');

/**
 * Pipeline 1: top 10 tags by count of published posts.
 */
const topTagsByPublishedPostCount = (limit = 10) =>
  Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', postCount: { $sum: 1 } } },
    { $sort: { postCount: -1, _id: 1 } },   // tie-break by tag name
    { $limit: limit },
    { $project: { _id: 0, tag: '$_id', postCount: 1 } },
  ]);

/**
 * Pipeline 2: authors whose published posts have avg(likes/views) > 0.05.
 * Guards against divide-by-zero with $cond.
 */
const authorsWithHighLikeViewRatio = (threshold = 0.05) =>
  Post.aggregate([
    { $match: { status: 'published' } },
    {
      $addFields: {
        likeViewRatio: {
          $cond: [{ $gt: ['$views', 0] }, { $divide: ['$likes', '$views'] }, 0],
        },
      },
    },
    {
      $group: {
        _id: '$authorId',
        avgLikeViewRatio: { $avg: '$likeViewRatio' },
        postCount: { $sum: 1 },
      },
    },
    { $match: { avgLikeViewRatio: { $gt: threshold } } },
    { $sort: { avgLikeViewRatio: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'author',
      },
    },
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        authorId: '$_id',
        authorName: '$author.name',
        avgLikeViewRatio: { $round: ['$avgLikeViewRatio', 4] },
        postCount: 1,
      },
    },
  ]);

/**
 * Pipeline 3: total views per month for published posts, last 6 months.
 */
const monthlyViewsLast6Months = () => {
  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  return Post.aggregate([
    { $match: { status: 'published', createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalViews: { $sum: '$views' },
        postCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        // e.g. "2026-06"
        monthLabel: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' },
              ],
            },
          ],
        },
        totalViews: 1,
        postCount: 1,
      },
    },
  ]);
};

module.exports = {
  topTagsByPublishedPostCount,
  authorsWithHighLikeViewRatio,
  monthlyViewsLast6Months,
};