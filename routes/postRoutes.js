const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const postController = require('../controllers/post.controller');

router.get('/posts/aggregations/top-tags', asyncHandler(postController.getTopTags));
router.get('/posts/aggregations/high-ratio-authors', asyncHandler(postController.getHighRatioAuthors));
router.get('/posts/aggregations/monthly-views', asyncHandler(postController.getMonthlyViews));

module.exports = router;