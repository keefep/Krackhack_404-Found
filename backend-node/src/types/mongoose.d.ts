import { Document, Types } from 'mongoose';

export interface MongooseDocument extends Document {
  _id: Types.ObjectId;
}
