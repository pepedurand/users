import { Document } from 'mongoose';

export interface Image extends Document {
  userId: string;
  file: string;
}
