import { db } from "../libs/db.js"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";


export const createProblem = async (req, res) => {
    const { title, description, difficulty, tag, example, constraints, testcases, codeSnippet, referenceSolution } = req.body
    if (!title || !description || !difficulty || !tag || !example || !constraints || !testcases || !codeSnippet || !referenceSolution) {
        return res.status(400).json({ message: "Please fill all the required fields" })
    }
    //Checking the user role 
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "You are not allowed to create problem" })
    }

    try {
        for (const [language, solutionCode] of Object.entries(referenceSolution)) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                return res.status(400).json({ error: `Language ${language} is not supported` })
            }
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))
            const submissionResults = await submitBatch(submissions);
            console.log("SubmissionResult", submissionResults);
            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    return res.status(400).json({ error: `Testcase ${i + 1} failed for language ${language}` });
                }
            }
            //save the problem to database
            const newProblem = await db.problem.create({
                data: {
                    title, description, difficulty, tag, example, constraints, testcases, codeSnippet, referenceSolution, userId: req.user.id,
                }
            })
            return res.status(201).json({
                success: true,
                message: "Problem created successfully",
                problem: newProblem,
            });
        }
    }
    catch (error) {
        console.error("Error occured while creating problem", error);
    }

}

export const getAllProblems = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const take = limit;
    try {
        const problems = await db.problem.findMany({
            skip: skip,
            take: take,
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!problems || problems.length === 0) {
            return res.status(404).json({ message: "No problems found" });
        }
        const totalProblems = await db.problem.count();
        const totalPages = Math.ceil(totalProblems / limit);
        return res.status(200).json({
            success: true,
            problems,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching problems", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getProblemById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Please provide a problem id" });
    }
    try {
        const problem = await db.problem.findUnique({
            where: {
                id: id,
            },
        });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        return res.status(200).json({
            success: true,
            problem,
        });
    } catch (error) {
        console.error("Error fetching problem", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateProblem = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Please provide a problem id" });
    }
    try {
        const problem = await db.problem.findUnique({
            where: {
                id: id,
            },
        });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        const updatedProblem = await db.problem.update({
            where: {
                id: id,
            },
            data: req.body,
        });
        return res.status(200).json({
            success: true,
            problem: updatedProblem,
        });
    } catch (error) {
        console.error("Error updating problem", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteProblem = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Please provide a problem id" });
    }
    try {
        const problem = await db.problem.findUnique({
            where: {
                id: id,
            },
        });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        await db.problem.delete({
            where: {
                id: id,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting problem", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllProblemsSolvedByUser = async (req, res) => { }



