import StatusCodes from 'http-status-codes';
import Books from '../DB/models/book.model.js';
import userModel from '../DB/models/user.model.js';
import {ErrorClass} from '../middlewares/ErrorClass.js';
import logger from '../middlewares/logger.js';
// ==================== 1]Add To Cart =====================================
export const addItemToCart = async (req, res, next) => {
  const {bookId, quantity} = req.body;
  const userId = req.user._id;// Extract userId from the token payload
  logger.info(`User ${userId} is adding book ${bookId} to cart`);
  const user = await userModel.findById(userId);
  if (!user) {
    logger.error(`User ${userId} not found`);
    return next(
      new ErrorClass(
        `This User Does not Exist`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const book = await Books.findById(bookId);
  if (!book) {
    logger.warn(`Book ${bookId} not found`);
    return next(
      new ErrorClass(
        `This Book Does not Exist`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const cart = user.cart || {items: [], totalPrice: 0};
  // check if book is already in the cart
  const existingItem = cart.items.find((item) => item.bookId.equals(bookId));
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({bookId: book._id, title: book.title, price: book.price, quantity});
  }

  // Recalulate Total Price
  cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  user.cart = cart;
  await user.save();
  logger.info(`Book ${bookId} added to cart for user ${userId}`);
  res.status(StatusCodes.OK)
    .json({message: 'Book Added to Cart Successfully', cart: user.cart});
};
// ==================== 2]Remove Item From Cart =================================
export const removeItem = async (req, res, next) => {
  const {bookId} = req.params; // Get bookId from params
  const userId = req.user._id;// Extract userId from the token payload
  logger.info(`User ${userId} is removing book ${bookId} from cart`);
  const user = await userModel.findById(userId);
  if (!user) {
    logger.error(`User ${userId} not found`);
    return next(
      new ErrorClass(
        `This User Does not Exist`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  // Check if the book exists in the cart
  const bookIndex = user.cart.items.findIndex((item) => item.bookId.equals(bookId));
  if (bookIndex === -1) {
    logger.warn(`Book ${bookId} not found in cart for user ${userId}`);
    return next(
      new ErrorClass('Book not found in the cart', StatusCodes.NOT_FOUND)
    );
  }

  // The negation (!) ensures that items matching the bookId are excluded from the new array.
  user.cart.items = user.cart.items.filter((item) => !item.bookId.equals(bookId));
  // Recalculate total price
  user.cart.totalPrice = user.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  await user.save();
  logger.info(`Book ${bookId} removed from cart for user ${userId}`);
  res.status(StatusCodes.OK)
    .json({message: 'Book Removed From Cart Successfully', cart: user.cart});
};
// ==================== 3]Get All Items From Cart ================================
export const getAllItems = async (req, res, next) => {
  const userId = req.user._id;// Extract userId from the token payload
  logger.info(`Fetching cart items for user ${userId}`);
  const user = await userModel.findById(userId).populate('cart.items.bookId');
  if (!user) {
    logger.error(`User ${userId} not found`);
    return next(
      new ErrorClass(
        `This User Does not Exist`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  res.status(StatusCodes.OK).json({cart: user.cart.items});
};
// ==================== 4]Remove All Items From Cart ========================
export const removeAllItems = async (req, res, next) => {
  const userId = req.user._id;// Extract userId from the token payload
  logger.info(`User ${userId} is clearing their cart`);
  const user = await userModel.findById(userId);
  if (!user) {
    logger.error(`User ${userId} not found`);
    return next(
      new ErrorClass(
        `This User Does not Exist`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  user.cart.items = []; // Clear all items
  await user.save();
  logger.info(`Cart cleared for user ${userId}`);
  res.status(StatusCodes.OK).json({message: 'Cart has been cleared'});
};
