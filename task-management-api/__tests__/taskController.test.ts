import { createTask } from '../src/controllers/taskController';
import Task from '../src/models/task';
import Project from '../src/models/project';

jest.mock('../src/models/task');
jest.mock('../src/models/project');

describe('createTask', () => {
  it('should create a task and return 201', async () => {
    const req = {
      params: { projectId: 'project-id' },
      body: { title: 'New Task', description: 'Task description' },
      user: { _id: 'user-id' },  // Ensure req.user is properly mocked
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // Mock Project.findById to return a valid project
    (Project.findById as jest.Mock).mockResolvedValue({
      _id: 'project-id',
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: 'user-id',
    });

    // Mock Task.prototype.save to return the expected task
    (Task.prototype.save as jest.Mock).mockResolvedValue({
      _id: 'task-id',
      title: 'New Task',
      description: 'Task description',
      status: undefined, // or the default status
      project: 'project-id',
      createdBy: 'user-id',
    });
    await createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return 404 if the project does not exist', async () => {
    const req = {
      params: { projectId: 'project-id' },
      body: { title: 'New Task', description: 'Task description' },
      user: { _id: 'user-id' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // Mock Project.findById to return null, indicating project not found
    (Project.findById as jest.Mock).mockResolvedValue(null);

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Project not found' });
  });
});
