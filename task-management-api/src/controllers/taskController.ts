import { Request, Response } from 'express';
import Task from '../models/task';
import Project from '../models/project';

// Create a new task within a project
export const createTask = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, description, status } = req.body;

        // Ensure the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Type guard to check if req.user exists
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const task = new Task({
            title,
            description,
            status,
            project: projectId,
            createdBy: req.user._id,
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Get all tasks for a project
export const getTasks = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // Ensure the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const tasks = await Task.find({ project: projectId });
        res.status(200).json(tasks);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
    try {
        const { projectId, taskId } = req.params;
        const { title, description, status } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: taskId, project: projectId },
            { title, description, status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { projectId, taskId } = req.params;

        const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};
