import mongoose from "mongoose";
import Book from "../DB/models/book.model.js";
import { ErrorClass } from "../middlewares/ErrorClass.js";
import StatusCodes from "http-status-codes";

export const validateBooks = async (books, session) => {
    if (!books || books.length === 0) {
        throw new ErrorClass(`Order must contain at least one book`, StatusCodes.BAD_REQUEST);
    }

    let totalPrice = 0;
    const bookUpdates = [];

    for (let item of books) {
        if (!mongoose.Types.ObjectId.isValid(item.book)) {
            throw new ErrorClass(`Invalid book ID: '${item.book}'.`, StatusCodes.BAD_REQUEST);
        }
        const book = await Book.findById(item.book).session(session);
        if (!book) {
            throw new ErrorClass(`Book not found: ${item.book}`, StatusCodes.NOT_FOUND);
        }
        if (book.stock < item.quantity) {
            throw new ErrorClass(`Sorry, only ${book.stock} copies of "${book.title}" are available.`, StatusCodes.BAD_REQUEST);
        }
        book.stock -= item.quantity;
        totalPrice += book.price * item.quantity;
        bookUpdates.push(book.save({ session }));
    }

    // Execute all stock updates
    await Promise.all(bookUpdates);
    return totalPrice;
};
