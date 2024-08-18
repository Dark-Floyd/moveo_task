import request from 'supertest';
import express from 'express';
import { deleteProject } from '../src/controllers/projectController';
import Project from '../src/models/project';
import { authMiddleware } from '../src/middleware/authMiddleware';
import { IUser } from '../src/models/user';
import mongoose from 'mongoose';

jest.mock('../src/models/project');
jest.mock('../src/middleware/authMiddleware');

const app = express();
app.use(express.json());
app.delete('/api/projects/:id', authMiddleware, deleteProject);

describe('DELETE /api/projects/:id', () => {
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

    it('should delete a project and return 200 when authenticated', async () => {
        const mockProjectId = new mongoose.Types.ObjectId();

        // Mock Project.findOneAndDelete to simulate successful deletion
        (Project.findOneAndDelete as jest.Mock).mockResolvedValue({
            _id: mockProjectId,
            name: 'Test Project',
            description: 'Test Description',
            createdBy: mockUser._id,
        });

        const response = await request(app)
            .delete(`/api/projects/${mockProjectId.toHexString()}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Project deleted');
    });

    it('should return 404 if the project does not exist', async () => {
        const mockProjectId = new mongoose.Types.ObjectId();

        // Mock Project.findOneAndDelete to return null, simulating a project not found
        (Project.findOneAndDelete as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .delete(`/api/projects/${mockProjectId.toHexString()}`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Project not found');
    });

    it('should return 401 if user is not authenticated', async () => {
        const mockProjectId = new mongoose.Types.ObjectId();

        // Mock authMiddleware to not set req.user
        (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
            req.user = undefined;
            next();
        });

        const response = await request(app)
            .delete(`/api/projects/${mockProjectId.toHexString()}`)
            .send();

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
});
