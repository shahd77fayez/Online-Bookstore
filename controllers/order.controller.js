import mongoose from "mongoose";
import Order from "../DB/models/order.model.js"
import { validateBooks } from "../middlewares/BookStockValidation.js";
import StatusCodes from "http-status-codes";
import { getIO } from '../index.router.js';
import { ErrorClass } from "../middlewares/ErrorClass.js";

export const placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!req.user || !req.user.id) {
            throw new ErrorClass("Unauthorized: Please log in to place an order.", StatusCodes.UNAUTHORIZED);
        }
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

        return res
            .status(StatusCodes.CREATED)
            .json({ message: "Order created successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

        return res.status(statusCode).json({ 
            message: `🚨 ${error.message || "Something went wrong!"}` 
        });
    } 
};

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('books.book', 'title author price')
            .sort({ createdAt: -1 });   
            res.status(StatusCodes.OK).json({ message: "Order history retrieved successfully", orders });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: `Server error: ${error.message}` });
    }
};