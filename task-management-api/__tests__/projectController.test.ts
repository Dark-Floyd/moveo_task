import request from 'supertest';
import express from 'express';
import { createProject } from '../src/controllers/projectController';
import Project from '../src/models/project';
import { authMiddleware } from '../src/middleware/authMiddleware';
import { IUser } from '../src/models/user';
import mongoose from 'mongoose';

jest.mock('../src/models/project');
jest.mock('../src/middleware/authMiddleware');

const app = express();
app.use(express.json());
app.post('/api/projects', authMiddleware, createProject);

describe('POST /api/projects', () => {
    let mockUser: IUser;

    beforeEach(() => {
        mockUser = {
            _id: new mongoose.Types.ObjectId(),
            cognitoId: 'cognito-id',
            username: 'testuser',
            email: 'testuser@example.com',
            role: 'user',
        } as IUser;

        // Mock authMiddleware to set req.user
        (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    it('should create a project and return 201 when authenticated', async () => {
        const mockProject = {
            _id: new mongoose.Types.ObjectId(),
            name: 'New Project',
            description: 'Project description',
            createdBy: mockUser._id,
        };

        (Project.prototype.save as jest.Mock).mockResolvedValue(mockProject);

        const response = await request(app)
            .post('/api/projects')
            .send({
                name: 'New Project',
                description: 'Project description',
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            _id: mockProject._id.toHexString(),
            name: mockProject.name,
            description: mockProject.description,
            createdBy: mockUser._id.toHexString(),
        });
    });

    it('should return 401 if user is not authenticated', async () => {
        // Mock authMiddleware to not set req.user
        (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
            req.user = undefined;
            next();
        });

        const response = await request(app)
            .post('/api/projects')
            .send({
                name: 'New Project',
                description: 'Project description',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

});
