import { IUser } from '../models/user'; // Adjust the path as needed

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser; // Add the user property to the Request interface
  }
}
