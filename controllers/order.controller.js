const Order = require('../models/Order');
const Book = require('../models/Book');
import StatusCodes from "http-status-codes";
import { ErrorClass } from "../middlewares/ErrorClass.js";

exports.placeOrder = async (req, res) => {
    try {
        const { books } = req.body;
        if (!books || books.length === 0)
            return next(
                new ErrorClass(
                    `Order must contain at least one book`,
                    StatusCodes.BAD_REQUEST
                )
            );
        let totalPrice = 0;
        for (let item of books) {
            const book = await Book.findById(item.book);
            if (!book)
                return next(
                    new ErrorClass(
                        `Book not found: ${item.book}`,
                        StatusCodes.NOT_FOUND
                    )
                );
            if (book.stock < item.quantity)
                return next(
                    new ErrorClass(
                        `Not enough stock for "${book.title}"`,
                        StatusCodes.BAD_REQUEST
                    )
                );
            totalPrice += book.price * item.quantity;
        }

        const order = new Order({ user: req.user.id, books, totalPrice });
        await order.save();
        res
            .status(StatusCodes.CREATED)
            .json({ message: "Order created successfully", order });

    } catch (error) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: `Server error: ${error.message}` });

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
