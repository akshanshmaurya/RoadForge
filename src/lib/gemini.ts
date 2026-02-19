import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return genAI;
}

async function callWithRetry(fn: () => Promise<string>, retries = 2): Promise<string> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error: unknown) {
            const isRateLimit = error instanceof Error && error.message?.includes('429');
            if (isRateLimit && i < retries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, i) * 5000; // 5s, 10s
                console.log(`Gemini rate limited, retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Gemini: max retries exceeded');
}

export async function generateContent(prompt: string): Promise<string> {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    return callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    });
}

export async function generateJSON<T>(prompt: string): Promise<T> {
    const text = await generateContent(prompt);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    }

    // Try to find JSON object/array in the response
    const start = jsonStr.indexOf('{') !== -1 ? jsonStr.indexOf('{') : jsonStr.indexOf('[');
    const end = jsonStr.lastIndexOf('}') !== -1 ? jsonStr.lastIndexOf('}') + 1 : jsonStr.lastIndexOf(']') + 1;

    if (start === -1 || end <= start) {
        throw new Error('No valid JSON found in Gemini response');
    }

    jsonStr = jsonStr.slice(start, end);
    return JSON.parse(jsonStr) as T;
}
