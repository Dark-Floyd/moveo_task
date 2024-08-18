import request from 'supertest';
import express from 'express';
import { login } from '../src/controllers/authController';
import User from '../src/models/user';
import jwt from 'jsonwebtoken';

jest.mock('amazon-cognito-identity-js', () => ({
    AuthenticationDetails: jest.fn(),
    CognitoUser: jest.fn().mockImplementation(() => ({
        authenticateUser: jest.fn(),
        completeNewPasswordChallenge: jest.fn(),
    })),
    CognitoUserPool: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../src/models/user');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.post('/api/auth/login', login);

describe('POST /api/auth/login', () => {
    it('should return 200 and a token for valid credentials', async () => {
        const mockToken = 'mocked-jwt-token';
        const mockDecodedToken = {
            sub: 'cognito-id',
            email: 'testuser@example.com',
        };

        // Mock CognitoUser.authenticateUser success
        const cognitoUserMock = (require('amazon-cognito-identity-js').CognitoUser as jest.Mock).mockImplementation(() => ({
            authenticateUser: (authDetails: any, callbacks: any) => {
                callbacks.onSuccess({
                    getIdToken: () => ({
                        getJwtToken: () => mockToken,
                    }),
                });
            },
        }));

        // Mock JWT decode
        (jwt.decode as jest.Mock).mockReturnValue(mockDecodedToken);

        // Mock User.findOne to return null (simulating a new user)
        (User.findOne as jest.Mock).mockResolvedValue(null);

        // Mock User.save to succeed
        (User.prototype.save as jest.Mock).mockResolvedValue({});

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token', mockToken);
        expect(User.findOne).toHaveBeenCalledWith({ cognitoId: 'cognito-id' });
        expect(User.prototype.save).toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
        // Mock CognitoUser.authenticateUser failure
        const cognitoUserMock = (require('amazon-cognito-identity-js').CognitoUser as jest.Mock).mockImplementation(() => ({
            authenticateUser: (authDetails: any, callbacks: any) => {
                callbacks.onFailure(new Error('Invalid credentials'));
            },
        }));

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should handle newPasswordRequired challenge', async () => {
        const mockToken = 'mocked-jwt-token';
        const mockDecodedToken = {
            sub: 'cognito-id',
            email: 'testuser@example.com',
        };

        // Mock CognitoUser.authenticateUser newPasswordRequired
        const cognitoUserMock = (require('amazon-cognito-identity-js').CognitoUser as jest.Mock).mockImplementation(() => ({
            authenticateUser: (authDetails: any, callbacks: any) => {
                callbacks.newPasswordRequired({}, {});
            },
            completeNewPasswordChallenge: (password: string, userAttributes: any, callbacks: any) => {
                callbacks.onSuccess({
                    getIdToken: () => ({
                        getJwtToken: () => mockToken,
                    }),
                });
            },
        }));


        (jwt.decode as jest.Mock).mockReturnValue(mockDecodedToken);


        (User.findOne as jest.Mock).mockResolvedValue(null);

        // Mock User.save to succeed
        (User.prototype.save as jest.Mock).mockResolvedValue({});

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token', mockToken);
        expect(User.findOne).toHaveBeenCalledWith({ cognitoId: 'cognito-id' });
        expect(User.prototype.save).toHaveBeenCalled();
    });
});
