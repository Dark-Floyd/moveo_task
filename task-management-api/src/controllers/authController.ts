import { Request, Response } from 'express';
import { registerUser, authenticateUser } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  try {
    const user = await registerUser(username, password, email);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const token = await authenticateUser(username, password);
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};
