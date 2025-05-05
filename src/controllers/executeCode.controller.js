import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";

export const executeCode = async (req, res) => {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user.id
    try {

        //validate test cases
        if (!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({ error: "Invalid or missing test cases" });
        }

        //Preapre each test cases for judg batch submission
        const submission = stdin.map((input) => ({
            source_code, language_id, stdin: input,
        })
        );
        //3 Send batch of submission to judge 0
        const submitResponse = await submitBatch(submission);

        const tokens = submitResponse.map((res) => res.token);

        //4.Poll judge0 for results of all submitted test cases
        const results = await pollBatchResults(tokens);
        let allPassed = true;
        const detailedResults = results.map((res, i) => {
            const stdout = res.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if (!passed) allPassed = false;

            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: res.stderr || null,
                compile_output: res.compile_output || null,
                status: res.status.description,
                memory: res.memory ? `${res.memory} KB` : undefined,
                time: res.time ? `${res.time} s` : undefined
            }
        })

        //submission summary
        const submissionCode = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),

                stdout: JSON.stringify(detailedResults.map((r) => {
                    r.stdout
                })),

                stderr: JSON.stringify(detailedResults.some((r) => r.stderr)) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,

                compileOutput: JSON.stringify(detailedResults.some((r) => r.compile_output))
                    ? JSON.stringify(detailedResults.map((r) => r.compile_output)) : null,

                status: allPassed ? "Accepted" : "Wrong Answer",

                memory: JSON.stringify(detailedResults.some((r) => r.memory)) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,

                time: JSON.stringify(detailedResults.some((r) => r.time)) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            }
        })

        // save problem solved by user
        if (allPassed) {
            await db.problemSolved.upsert({
                where: { userId_problemId: { userId, problemId } },
                update: {},
                create: { userId, problemId }
            })
        }

        //save each testcase result
        const testCaseResults = detailedResults.map((res) => ({
            submissionId: submissionCode.id,
            testCase: res.testCase,
            passed: res.passed,
            stdout: res.stdout,
            expected: res.expected,
            stderr: res.stderr,
            compileOutput: res.compile_output,
            status: res.status,
            memory: res.memory,
            time: res.time
        }))

        await db.testCaseResult.createMany({ data: testCaseResults });

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submissionCode.id,
            },
            include: {
                testcases: true,
            }
        })

        res.status(200).json({
            success: true,
            message: "Code Executed!",
            submission: submissionWithTestCase
        })


    }
    catch (error) {
        console.error("Error executing code", error);
        return res.status(500).json({ message: "Error executing code" });
    }
}