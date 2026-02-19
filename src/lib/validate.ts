import mongoose from 'mongoose';

/**
 * Validate a MongoDB ObjectId string
 */
export function isValidObjectId(id: unknown): id is string {
    if (typeof id !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Sanitize error for API responses — hide details in production
 */
export function sanitizeError(error: unknown): string {
    if (process.env.NODE_ENV === 'production') {
        return 'An internal error occurred';
    }
    if (error instanceof Error) return error.message;
    return String(error);
}

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
    const required = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    return { valid: missing.length === 0, missing };
}
