const Book = require("../models/Book");
import { ErrorClass } from "./ErrorClass.js";
import StatusCodes from "http-status-codes";

export const validateBooks = async (books, session) => {
    if (!books || books.length === 0) {
        throw new ErrorClass(`Order must contain at least one book`, StatusCodes.BAD_REQUEST);
    }

    let totalPrice = 0;
    const bookUpdates = [];

    for (let item of books) {
        const book = await Book.findById(item.book).session(session);
        if (!book) {
            throw new ErrorClass(`Book not found: ${item.book}`, StatusCodes.NOT_FOUND);
        }
        if (book.stock < item.quantity) {
            throw new ErrorClass(`Not enough stock for "${book.title}"`, StatusCodes.BAD_REQUEST);
        }
        totalPrice += book.price * item.quantity;
        book.stock -= item.quantity;
        bookUpdates.push(book.save({ session }));
    }

    await Promise.all(bookUpdates);
    return totalPrice;
};
