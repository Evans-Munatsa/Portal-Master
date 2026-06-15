import { sanitizeResume } from '@/lib/gemini';

describe('Gemini API Utilities', () => {
  describe('sanitizeResume', () => {
    it('should remove null bytes and control characters', () => {
      const dirtyString = 'Hello\x00World\x1FTest';
      const cleanString = sanitizeResume(dirtyString);
      expect(cleanString).toBe('HelloWorldTest');
    });

    it('should limit string length to 15000 characters', () => {
      const longString = 'a'.repeat(20000);
      const cleanString = sanitizeResume(longString);
      expect(cleanString.length).toBe(15000);
    });

    it('should preserve regular characters, spaces, and formatting', () => {
      const regularString = 'John Doe\nSoftware Engineer\nNode.js, React, TypeScript';
      const cleanString = sanitizeResume(regularString);
      expect(cleanString).toBe(regularString);
    });
  });
});
