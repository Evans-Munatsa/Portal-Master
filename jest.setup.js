import { jest } from '@jest/globals';

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('jose', () => ({
  SignJWT: class {
    constructor(payload) {
      this.payload = payload;
    }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() {
      return Buffer.from(JSON.stringify(this.payload)).toString('base64');
    }
  },
  jwtVerify: async (token) => {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      return { payload };
    } catch {
      throw new Error('Invalid token');
    }
  }
}));

// Mock process.env
process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-gemini-key';
