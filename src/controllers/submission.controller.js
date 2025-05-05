export const getAllSubmission = async (req, res) => {
    const { id } = req.user;
    try {
        const submissions = await db.submission.findMany({
            where: {
                userId: id
            },
            include: {
                problem: true,
                user: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ error: "Error fetching submissions" });
    }
}

export const getSubmissionForProblem = async (req, res) => {
    const { id } = req.user;
    const { problemId } = req.params;
    try {
        const submission = await db.submission.findMany({
            where: {
                userId: id,
                problemId: Number(problemId)
            },
            include: {
                problem: true,
                user: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return res.status(200).json(submission);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ error: "Error fetching submissions" });
    }
}

export const getAllTheSubmissionsForProblem = async (req, res) => {
    const { id } = req.user;
    const { problemId } = req.params;
    try {
        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        })
        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissionCount: submission
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ error: "Error fetching submissions" });
    }
}