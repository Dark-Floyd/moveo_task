"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const project_1 = __importDefault(require("../models/project"));
// Create a new project
const createProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, description } = req.body;
    try {
        const project = new project_1.default({
            name,
            description,
            createdBy: req.user._id, // Ensure req.user._id is set correctly
        });
        yield project.save();
        res.status(201).json(project);
    }
    catch (err) {
        next(err); // Pass the error to the centralized error handler
    }
});
exports.createProject = createProject;
// Get all projects
const getProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user._id;
    try {
        const projects = yield project_1.default.find({ createdBy: userId });
        res.status(200).json(projects);
    }
    catch (err) {
        next(err);
    }
});
exports.getProjects = getProjects;
// Get a single project by ID
const getProjectById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    try {
        const project = yield project_1.default.findOne({ _id: id, createdBy: req.user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(project);
    }
    catch (err) {
        next(err);
    }
});
exports.getProjectById = getProjectById;
// Update a project
const updateProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const project = yield project_1.default.findOneAndUpdate({ _id: id, createdBy: req.user._id }, { name, description }, { new: true });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(project);
    }
    catch (err) {
        next(err);
    }
});
exports.updateProject = updateProject;
// Delete a project
const deleteProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    try {
        const project = yield project_1.default.findOneAndDelete({ _id: id, createdBy: req.user._id });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json({ message: 'Project deleted' });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteProject = deleteProject;
