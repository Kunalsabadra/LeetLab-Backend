import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { executeCode } from '../controllers/executeCode.controller.js';


export const executeCodeRoutes = Router();

executeCodeRoutes.post('/code', authMiddleware, executeCode)