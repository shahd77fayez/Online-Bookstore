const Book = require('../models/Book');

const validateOrder = async (books) => {
  if (!books || !Array.isArray(books) || books.length === 0) {
    return { valid: false, message: 'Order must contain at least one book' };
  }

  let totalPrice = 0;

  for (let item of books) {
    const book = await Book.findById(item.book);
    if (!book) return { valid: false, message: `Book not found: ${item.book}` };
    if (book.stock < item.quantity) {
      return { valid: false, message: `Not enough stock for "${book.title}"` };
    }
    totalPrice += book.price * item.quantity;
  }
  return totalPrice ;
};

module.exports = { validateOrder };
