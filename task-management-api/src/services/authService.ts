import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    CognitoUserAttribute,
  } from 'amazon-cognito-identity-js';
  
  const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
    ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
  };
  
  const userPool = new CognitoUserPool(poolData);
  
  // Register a new user with email, username, and password
  export const registerUser = async (username: string, password: string, email: string) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'preferred_username',
          Value: username,
        }),
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
      ];
  
      userPool.signUp(username, password, attributeList, [], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result?.user);
      });
    });
  };
  
  // Authenticate a user with username and password
  export const authenticateUser = async (username: string, password: string) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });
  
    const userData = {
      Username: username,
      Pool: userPool,
    };
  
    const cognitoUser = new CognitoUser(userData);
  
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result.getAccessToken().getJwtToken());
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle the new password requirement
          delete userAttributes.email; // Do not include attributes that cannot be changed
          delete userAttributes.email_verified; // Remove immutable attributes
  
          cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
            onSuccess: (result) => {
              resolve(result.getAccessToken().getJwtToken());
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        },
      });
    });
  };
  