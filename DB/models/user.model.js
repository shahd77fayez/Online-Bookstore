import process from 'node:process';
import bcrypt from 'bcryptjs';
import mongoose, {Schema, Types} from 'mongoose';

const userSchema = new Schema (
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    username: {
      type: String,
      lowercase: true,
      required: true
    },
    email: {
      type: String,
      unique: [true, 'Email Must be Unique'],
      required: true
    },
    password: {
      type: String,
      required: [true, 'Password Is Required']
    },
    phone: {
      type: String
    },
    dob: {
      type: Date
    },
    role: {
      type: String,
      default: 'User',
      enum: ['User', 'Admin']
    },
    code: {
      type: String
    },
    codeExpires: {type: Date}, // Expiration time for reset code
    isConfirmed: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    cart: { // Embedded Cart
      items: [
        {
          bookId: {type: Types.ObjectId, ref: 'Books', required: true},
          title: {type: String}, // Snapshot of title at time of adding to cart
          price: {type: Number}, // Snapshot of price
          quantity: {type: Number, required: true, min: 1}
        }
      ],
      totalPrice: {type: Number, default: 0}
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password not modified
  const saltRounds = Number(process.env.SALT_ROUND);
  this.password = await bcrypt.hash(this.password, saltRounds); // Hash with salt rounds = 10
  next();
});

// Compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);
export default userModel;
