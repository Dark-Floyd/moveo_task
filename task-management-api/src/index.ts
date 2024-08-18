import dotenv from 'dotenv';
dotenv.config();  

import express,  { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import connectDB from './config/db';
import { logger } from './utils/logger';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import { authMiddleware } from './middleware/authMiddleware';

// Connect to the database
connectDB();

const app = express();
app.use(express.json());

app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects',authMiddleware, projectRoutes); 
app.use('/api/projects',authMiddleware, taskRoutes);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global Error Handler:', err.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  });

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Task Management API');
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
