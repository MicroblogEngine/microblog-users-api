import { describe, it, expect, vi } from 'vitest';
import { generatePassword, validPassword } from './password';
import crypto from 'crypto';

// Mock crypto module
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(),
    pbkdf2Sync: vi.fn()
  }
}));

describe('Password Helper Functions', () => {
  describe('generatePassword', () => {
    it('should generate salt and hash for a password', () => {
      // Mock implementations
      const mockSalt = 'mockedsalt123';
      const mockHash = 'mockedhash456';
      
      vi.mocked(crypto.randomBytes).mockReturnValue({
        toString: () => mockSalt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      
      vi.mocked(crypto.pbkdf2Sync).mockReturnValue({
        toString: () => mockHash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = generatePassword('mypassword');

      // Verify the result
      expect(result).toEqual({
        salt: mockSalt,
        hash: mockHash
      });

      // Verify crypto functions were called with correct parameters
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        'mypassword',
        mockSalt,
        10000,
        64,
        'sha512'
      );
    });
  });

  describe('validPassword', () => {
    it('should return true for matching password', () => {
      const mockHash = 'correcthash123';
      vi.mocked(crypto.pbkdf2Sync).mockReturnValue({
        toString: () => mockHash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = validPassword('correctpassword', mockHash, 'somesalt');

      expect(result).toBe(true);
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        'correctpassword',
        'somesalt',
        10000,
        64,
        'sha512'
      );
    });

    it('should return false for non-matching password', () => {
      const storedHash = 'correcthash123';
      vi.mocked(crypto.pbkdf2Sync).mockReturnValue({
        toString: () => 'differenthash456'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = validPassword('wrongpassword', storedHash, 'somesalt');

      expect(result).toBe(false);
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        'wrongpassword',
        'somesalt',
        10000,
        64,
        'sha512'
      );
    });
  });

  it('should use consistent parameters for hashing', () => {
    const password = 'testpassword';
    const salt = 'testsalt';
    
    generatePassword(password);
    validPassword(password, 'somehash', salt);

    // Verify both functions use the same hashing parameters
    const calls = vi.mocked(crypto.pbkdf2Sync).mock.calls;
    calls.forEach(call => {
      expect(call[2]).toBe(10000); // iterations
      expect(call[3]).toBe(64);    // key length
      expect(call[4]).toBe('sha512'); // digest
    });
  });
}); 