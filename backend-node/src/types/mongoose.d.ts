import { Types } from 'mongoose';
import { IUser } from './models';

// Type guard for checking if a value is a MongoDB ObjectId
export function isObjectId(value: any): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

// Extend the base types
declare module 'mongoose' {
  interface Document {
    _id: Types.ObjectId;
  }
}

// Reference types
export type MongoRef<T> = Types.ObjectId | T;

// Helper type for populated fields
export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Types.ObjectId ? MongoRef<IUser> : T[P];
};
