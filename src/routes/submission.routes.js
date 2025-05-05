import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware";
import { getAllSubmission, getAllTheSubmissionsForProblem, getSubmissionForProblem } from "../controllers/submission.controller";

export const submissionRoutes = Router();

submissionRoutes.get("/set-all-submissions", authMiddleware, getAllSubmission);

submissionRoutes.get("/get-submission/:id", authMiddleware, getSubmissionForProblem);

submissionRoutes.get("/get-submission-count/:problemId", authMiddleware, getAllTheSubmissionsForProblem);