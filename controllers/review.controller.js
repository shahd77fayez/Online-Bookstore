import { Review } from '../DB/models/review.model.js';
import { reviewValidation } from '../validation/review.validation.js';
import { Book } from '../DB/models/book.model.js';

// Create a new review
export const createReview = async (req, res) => {
    // Validate request body
    const { error } = reviewValidation.createReview.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if book exists
    const book = await Book.findById(req.body.book);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
        user: req.user._id,
        book: req.body.book
    });
    if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create review
    const review = new Review({
        user: req.user._id,
        book: req.body.book,
        rating: req.body.rating,
        review: req.body.review
    });

    await review.save();

    // Populate user and book details
    await review.populate('user', 'name email');
    await review.populate('book', 'title author');

    res.status(201).json(review);
};

// Get all reviews for a book
export const getBookReviews = async (req, res) => {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ book: bookId })
        .populate('user', 'name email')
        .populate('book', 'title author')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ book: bookId });

    res.json({
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
    });
};

// Update a review
export const updateReview = async (req, res) => {
    const { reviewId } = req.params;

    // Validate request body
    const { error } = reviewValidation.updateReview.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update review
    review.set(req.body);
    await review.save();

    // Populate user and book details
    await review.populate('user', 'name email');
    await review.populate('book', 'title author');

    res.json(review);
};

// Delete a review
export const deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user._id })
        .populate('book', 'title author')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
    });
};