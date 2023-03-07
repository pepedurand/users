import * as mongoose from 'mongoose';

export const ImageSchema = new mongoose.Schema(
  {
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    file: Buffer,
  },
  {
    collection: 'images',
    versionKey: false,
  },
);
