import { Request, Response, NextFunction } from 'express';
import Project from '../models/project';

// Create a new project
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, description } = req.body;

  try {
    const project = new Project({
      name,
      description,
      createdBy: req.user._id, // Ensure req.user._id is set correctly
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    next(err); // Pass the error to the centralized error handler
  }
};

// Get all projects
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = req.user._id;
  try {
    const projects = await Project.find({ createdBy: userId });
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

// Get a single project by ID
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const project = await Project.findOne({ _id: id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { name, description },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const project = await Project.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};
