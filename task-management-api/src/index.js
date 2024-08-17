"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables first
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./utils/logger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
// Connect to the database
(0, db_1.default)();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// app.use(authMiddleware); // Apply authentication middleware globally if needed
// Set up morgan to use the winston logger
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim()),
    },
}));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default); // Project routes
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Task Management API');
});
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
