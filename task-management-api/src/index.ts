// src/index.ts
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables first

import express from 'express';
import morgan from 'morgan';
import connectDB from './config/db';
import { logger } from './utils/logger';
import authRoutes from './routes/authRoutes';

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Set up morgan to use the winston logger
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Task Management API');
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
