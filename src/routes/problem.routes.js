import { Router } from 'express';
import { getAllProblems, getProblemById, updateProblem, deleteProblem, createProblem, getAllProblemsSolvedByUser } from '../controllers/problem.controller.js';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware.js';

const problemRoutes = Router();

problemRoutes.post('/create-problem', authMiddleware, isAdmin, createProblem);

problemRoutes.get('/get-all-problems', authMiddleware, getAllProblems);

problemRoutes.get('/get-problem/:id', authMiddleware, getProblemById);

problemRoutes.put('/update-problem/:id', authMiddleware, isAdmin, updateProblem);

problemRoutes.delete('/delete-problem/:id', authMiddleware, isAdmin, deleteProblem)

problemRoutes.get('/get-solved-problem', authMiddleware, getAllProblemsSolvedByUser)

export default problemRoutes;




