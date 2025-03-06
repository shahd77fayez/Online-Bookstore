import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const BooksSchema = new mongoose.Schema({
  bookId: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    minLength: 8,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  
  description: {
    type: String,
    minLength: 8,
  },
  stock: {
    type: Number,
    required: true,
  },
  reviews: {
    type: Number,
    ref: 'reviews',
    required: true,
  },
  Image: {
    type: String,
  }
});


BooksSchema.set('toJSON', {
  transform: (doc, {__v, ...rest}, options) => rest
});
const AutoIncrement = AutoIncrementFactory(mongoose);
BooksSchema.plugin(AutoIncrement, {inc_field: 'bookId'});

const Books = mongoose.model('Books', BooksSchema);

export default Books;