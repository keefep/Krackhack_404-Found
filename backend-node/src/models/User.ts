import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { ValidationError } from '../utils/errors';

export interface IUser {
  name: string;
  email: string;
  password: string;
  collegeId: string;
  role: 'user' | 'admin' | 'moderator';
  phoneNumber?: string;
  verified: boolean;
  idCardVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, {}, IUser> & 
  Omit<IUser & { _id: Types.ObjectId }, keyof IUserMethods> & 
  IUserMethods;

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,}$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    collegeId: {
      type: String,
      required: [true, 'Please provide your college ID'],
      unique: true,
      trim: true,
      match: [/^[A-Z0-9]{6,10}$/, 'Please provide a valid college ID'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[0-9]{10,12}$/, 'Please provide a valid phone number'],
      sparse: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    idCardVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ collegeId: 1 });

// Hash password before saving
userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new ValidationError('Error comparing passwords');
  }
};

// Static method to find by email
userSchema.static('findByEmail', function(email: string) {
  return this.findOne({ email });
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
