import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Ensure _id is typed correctly
  cognitoId: string;            // Field to store Cognito UUID
  username: string;
  email: string;
  role: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    cognitoId: {
      type: String,
      required: true,
      unique: true, // Ensure Cognito ID is unique
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
