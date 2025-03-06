import Book from '../DB/models/book.model.js';

export const create = async(data) => {
  //console.log(data);
  const newBook = await Book.create(data);
  return newBook;
}
export const getAll = async() => {
  const books = await Book.find();
  return books;
}
export const getById = async(id) => {
  const book = await Book.find({bookId: id});
  return book;
}
export const updateById = async(id, data) => {
  const book = await Book.updateOne({bookId: id}, data);
  return book;
}
export const deleteById = async(id) => {
  const book = await Book.deleteOne({bookId: id});
  return book;
}