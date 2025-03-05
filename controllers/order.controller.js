const mongoose = require("mongoose");
const Order = require('../models/Order');
const Book = require('../models/Book');
import { validateBooks } from "../middlewares/BookValidation.js";
import StatusCodes from "http-status-codes";
import { ErrorClass } from "../middlewares/ErrorClass.js";

exports.placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { books } = req.body;
        const totalPrice = await validateBooks(books, session);

        const order = new Order({ user: req.user.id, books, totalPrice });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        res
            .status(StatusCodes.CREATED)
            .json({ message: "Order created successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};


exports.getOrderHistory = async (req, res) => {
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
