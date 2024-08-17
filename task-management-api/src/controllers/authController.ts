import { Request, Response } from 'express';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';
import User from '../models/user'; // Ensure this path is correct

const poolData = {
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
  ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export const register = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  try {
    const user = new User({ username, email });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async (result) => {
      const idToken = result.getIdToken().getJwtToken();
      const decoded = jwt.decode(idToken) as jwt.JwtPayload;

      // Extract Cognito ID (sub) from the token
      const cognitoId = decoded.sub;
      const email = decoded.email;

      // Check if the user already exists in MongoDB
      let user = await User.findOne({ cognitoId });

      // If user doesn't exist, create a new one
      if (!user) {
        user = new User({
          cognitoId,
          username,
          email,
        });
        await user.save();
      }

      res.status(200).json({ token: idToken });
    },
    onFailure: (err) => {
      res.status(401).json({ error: err.message });
    },
    newPasswordRequired: (userAttributes, requiredAttributes) => {
      // Filter out non-writable attributes
      delete userAttributes.email_verified;
      delete userAttributes.phone_number_verified;

      // Complete the new password challenge using the provided password
      cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
        onSuccess: async (result) => {
          const idToken = result.getIdToken().getJwtToken();
          const decoded = jwt.decode(idToken) as jwt.JwtPayload;

          // Extract Cognito ID (sub) from the token
          const cognitoId = decoded.sub;
          const email = decoded.email;

          // Check if the user already exists in MongoDB
          let user = await User.findOne({ cognitoId });

          // If user doesn't exist, create a new one
          if (!user) {
            user = new User({
              cognitoId,
              username,
              email,
            });
            await user.save();
          }

          res.status(200).json({ token: idToken });
        },
        onFailure: (err) => {
          res.status(401).json({ error: err.message });
        },
      });
    },
  });
};
