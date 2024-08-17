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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const user_1 = __importDefault(require("../models/user"));
const client = (0, jwks_rsa_1.default)({
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key === null || key === void 0 ? void 0 : key.getPublicKey();
        callback(null, signingKey);
    });
}
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    console.log('Received token:', token);
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        jsonwebtoken_1.default.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(400).json({ error: 'Invalid token.' });
            }
            console.log('Decoded token:', decoded);
            console.log('Decoded Cognito ID (sub):', decoded.sub);
            const user = yield user_1.default.findOne({ cognitoId: decoded.sub });
            if (!user) {
                console.log('No user found with cognitoId:', decoded.sub);
                return res.status(401).json({ error: 'Invalid token. User not found.' });
            }
            req.user = user;
            console.log('User attached to request:', req.user);
            next();
        }));
    }
    catch (err) {
        console.error('Token verification failed:', err);
        res.status(400).json({ error: 'Invalid token.' });
    }
});
exports.authMiddleware = authMiddleware;
