import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}
