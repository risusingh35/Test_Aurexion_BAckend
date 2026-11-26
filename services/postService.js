const postRepository = require('../repositories/postRepository');
const AppError = require('../utils/AppError');

const getTopTags = async (limit) => {
  const data = await postRepository.topTagsByPublishedPostCount(limit);
  if (!data.length) throw new AppError('No published posts found', 404);
  return data;
};

const getHighRatioAuthors = async (threshold) => {
  const data = await postRepository.authorsWithHighLikeViewRatio(threshold);
  if (!data.length) throw new AppError('No authors match the ratio criteria', 404);
  return data;
};

const getMonthlyViews = async () => {
  const data = await postRepository.monthlyViewsLast6Months();
  if (!data.length) throw new AppError('No published posts in the last 6 months', 404);
  return data;
};

module.exports = { getTopTags, getHighRatioAuthors, getMonthlyViews };