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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.registerUser = void 0;
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId: process.env.AWS_COGNITO_CLIENT_ID,
};
const userPool = new amazon_cognito_identity_js_1.CognitoUserPool(poolData);
// Register a new user with email, username, and password
const registerUser = (username, password, email) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const attributeList = [
            new amazon_cognito_identity_js_1.CognitoUserAttribute({
                Name: 'preferred_username',
                Value: username,
            }),
            new amazon_cognito_identity_js_1.CognitoUserAttribute({
                Name: 'email',
                Value: email,
            }),
        ];
        userPool.signUp(username, password, attributeList, [], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result === null || result === void 0 ? void 0 : result.user);
        });
    });
});
exports.registerUser = registerUser;
// Authenticate a user with username and password
const authenticateUser = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
        Username: username,
        Password: password,
    });
    const userData = {
        Username: username,
        Pool: userPool,
    };
    const cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
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
});
exports.authenticateUser = authenticateUser;
