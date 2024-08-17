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
exports.login = exports.register = void 0;
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user")); // Ensure this path is correct
const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId: process.env.AWS_COGNITO_CLIENT_ID,
};
const userPool = new amazon_cognito_identity_js_1.CognitoUserPool(poolData);
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    try {
        const user = new user_1.default({ username, email });
        yield user.save();
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
        Username: username,
        Password: password,
    });
    const userData = {
        Username: username,
        Pool: userPool,
    };
    const cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => __awaiter(void 0, void 0, void 0, function* () {
            const idToken = result.getIdToken().getJwtToken();
            const decoded = jsonwebtoken_1.default.decode(idToken);
            // Extract Cognito ID (sub) from the token
            const cognitoId = decoded.sub;
            const email = decoded.email;
            // Check if the user already exists in MongoDB
            let user = yield user_1.default.findOne({ cognitoId });
            // If user doesn't exist, create a new one
            if (!user) {
                user = new user_1.default({
                    cognitoId,
                    username,
                    email,
                });
                yield user.save();
            }
            res.status(200).json({ token: idToken });
        }),
        onFailure: (err) => {
            res.status(401).json({ error: err.message });
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
            // Filter out non-writable attributes
            delete userAttributes.email_verified;
            delete userAttributes.phone_number_verified;
            // Complete the new password challenge using the provided password
            cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
                onSuccess: (result) => __awaiter(void 0, void 0, void 0, function* () {
                    const idToken = result.getIdToken().getJwtToken();
                    const decoded = jsonwebtoken_1.default.decode(idToken);
                    // Extract Cognito ID (sub) from the token
                    const cognitoId = decoded.sub;
                    const email = decoded.email;
                    // Check if the user already exists in MongoDB
                    let user = yield user_1.default.findOne({ cognitoId });
                    // If user doesn't exist, create a new one
                    if (!user) {
                        user = new user_1.default({
                            cognitoId,
                            username,
                            email,
                        });
                        yield user.save();
                    }
                    res.status(200).json({ token: idToken });
                }),
                onFailure: (err) => {
                    res.status(401).json({ error: err.message });
                },
            });
        },
    });
});
exports.login = login;
