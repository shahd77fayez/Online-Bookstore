import express from 'express';
//import { isAuthenticated } from '../middleware/auth.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/ErrorHandling.js';
import {
    createReview,
    getBookReviews,
    updateReview,
    deleteReview,
    getUserReviews
} from '../controllers/review.controller.js';

const router = express.Router();

// Public routes
router.get('/book/:bookId', asyncHandler(getBookReviews));

// Protected routes (require authentication)
router.use(auth());

router.post('/', asyncHandler(createReview));
router.get('/user/me', asyncHandler(getUserReviews));
router.route('/:reviewId')
    .put(asyncHandler(updateReview))
    .delete(asyncHandler(deleteReview));

export default router;