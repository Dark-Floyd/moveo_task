import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User, { IUser } from '../models/user';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(400).json({ error: 'Invalid token.' });
      }

      console.log('Decoded token:', decoded);
      console.log('Decoded Cognito ID (sub):', (decoded as JwtPayload).sub);

      const user = await User.findOne({ cognitoId: (decoded as JwtPayload).sub }) as IUser;

      if (!user) {
        console.log('No user found with cognitoId:', (decoded as JwtPayload).sub);
        return res.status(401).json({ error: 'Invalid token. User not found.' });
      }

      req.user = user;
      console.log('User attached to request:', req.user);
      next();
    });
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(400).json({ error: 'Invalid token.' });
  }
};
