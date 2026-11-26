const postService = require('../services/postService');

exports.getTopTags = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const data = await postService.getTopTags(limit);
  res.status(200).json({ success: true, data });
};

exports.getHighRatioAuthors = async (req, res) => {
  const threshold = req.query.threshold ? Number(req.query.threshold) : 0.05;
  const data = await postService.getHighRatioAuthors(threshold);
  res.status(200).json({ success: true, data });
};

exports.getMonthlyViews = async (req, res) => {
  const data = await postService.getMonthlyViews();
  res.status(200).json({ success: true, data });
};