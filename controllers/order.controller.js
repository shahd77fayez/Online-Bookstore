import mongoose from "mongoose";
import Order from "../DB/models/order.model.js"
import Book from "../DB/models/book.model.js";
import { validateBooks } from "../middlewares/BookStockValidation.js";
import StatusCodes from "http-status-codes";
import { ErrorClass } from "../middlewares/ErrorClass.js";
import { getIO } from '../index.js';

export const placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { books } = req.body;
        const totalPrice = await validateBooks(books, session);

        const order = new Order({ user: req.user.id, books, totalPrice });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit socket event for new order
        const io = getIO();
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('books.book', 'title author price');

        io.emit('newOrder', {
            orderId: order._id,
            user: populatedOrder.user,
            totalPrice: order.totalPrice,
            books: populatedOrder.books
        });

        res
            .status(StatusCodes.CREATED)
            .json({ message: "Order created successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('books.book');
        res
            .status(StatusCodes.OK)
            .json({ message: "Orders retrieved successfully", orders });

    } catch (error) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: `Server error: ${error.message}` });

    }
};