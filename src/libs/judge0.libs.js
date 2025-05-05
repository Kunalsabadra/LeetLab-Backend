import axios from 'axios'


export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63
    }

    return languageMap[language];
}

export const submitBatch = async (submissions) => {
    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
        submissions
    })
    return data;
}

const sleep = (ms) => {
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const pollBatchResults = async (tokens) => {
    console.log("Polling for results", tokens);
    if (tokens.length === 0) return [];
    while (true) {
        const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            }
        })
        const results = data.submissions;
        const isAllDone = results.every((result) => {
            return result.status.id != 1 && result.status.id != 2;
        })
        if (isAllDone) return results;
        await sleep(1000)
    }
}

export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java",
    }
    return LANGUAGE_NAMES[languageId] || "Unknown";
}

