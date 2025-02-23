import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  collegeId: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@iitmandi\.ac\.in$/,
        'Please enter a valid IIT Mandi email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^(B|D|F|M|S)\d{5}|ADMIN\d{3}$/,
        'Please enter a valid College ID',
      ],
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, obj) => {
        delete obj.password;
        return obj;
      },
    },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ collegeId: 1 }, { unique: true });

// Ensure email is from IIT Mandi domain
userSchema.path('email').validate(function (email: string) {
  return email.endsWith('@iitmandi.ac.in');
}, 'Email must be from IIT Mandi domain');

// Ensure collegeId follows the pattern
userSchema.path('collegeId').validate(function (collegeId: string) {
  return /^(B|D|F|M|S)\d{5}|ADMIN\d{3}$/.test(collegeId);
}, 'Invalid College ID format');

const User = mongoose.model<IUser>('User', userSchema);

export default User;
