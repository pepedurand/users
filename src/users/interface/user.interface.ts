import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  first_name: string;
  last_name: number;
  avatar: string;
}
