import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    first_name: String,
    last_name: String,
    avatar: String,
  },
  {
    collection: 'users',
    versionKey: false,
  },
);
