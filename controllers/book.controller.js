import Book from '../DB/models/book.model';

const create = (data) => {
  console.log(data);
  const newBook = Book.create(data);
  return newBook;
}
const getAll = () => {
  const books = Book.find();
  return books;
}
const getById = (id) => {
  const book = Book.find({bookId: id});
  return book;
}
const updateById = (id, data) => {
  const book = Book.updateOne({bookId: id}, data);
  return book;
}
const deleteById = (id) => {
  const book = Book.deleteOne({bookId: id});
  return book;
}
export default {
  create,
  getAll,
  getById,
  updateById,
  deleteById
};