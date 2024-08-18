import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';
import taskRoutes from './taskRoutes'; // Import task routes

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

router.use('/:projectId/tasks', authMiddleware, taskRoutes);

export default router;
