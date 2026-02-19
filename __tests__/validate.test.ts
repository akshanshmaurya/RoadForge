import { isValidObjectId } from '../src/lib/validate';

describe('isValidObjectId', () => {
    it('should accept valid 24-char hex ObjectIds', () => {
        expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('should reject non-string values', () => {
        expect(isValidObjectId(123)).toBe(false);
        expect(isValidObjectId(null)).toBe(false);
        expect(isValidObjectId(undefined)).toBe(false);
    });

    it('should reject invalid strings', () => {
        expect(isValidObjectId('')).toBe(false);
        expect(isValidObjectId('invalid')).toBe(false);
        expect(isValidObjectId('too-short')).toBe(false);
    });

    it('should reject strings that look valid but are not', () => {
        expect(isValidObjectId('zzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
    });
});
