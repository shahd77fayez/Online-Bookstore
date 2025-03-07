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
    trim: true,
    minlength: 3,
    maxlength: 255
  },
  author: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    minLength: 25,
    trim: true,
    maxlength: 500
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: Number.isInteger
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  Image: {
    type: String
  }
}, {timestamps: true});

BooksSchema.set('toJSON', {
  transform: (doc, {__v, ...rest}) => rest
});
const AutoIncrement = AutoIncrementFactory(mongoose);
BooksSchema.plugin(AutoIncrement, {inc_field: 'bookId'});

const Books = mongoose.model('Books', BooksSchema);

export default Books;
