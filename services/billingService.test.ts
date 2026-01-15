import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCost, isBudgetAvailable, updateCumulativeCost } from './billingService';
import { getDoc, updateDoc } from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn().mockReturnValue({ id: 'billing-doc' }),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn((n) => n),
  getFirestore: vi.fn(),
}));

// Mock the Firebase service module to prevent real initialization
vi.mock('./firebase', () => ({
  db: {},
}));

describe('billingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for Gemini 2.5 Flash Lite (Input)', () => {
      const cost = calculateCost(1000000, 0, 'gemini-2.5-flash-lite-preview-09-2025');
      expect(cost).toBeCloseTo(0.075, 5);
    });

    it('should calculate cost correctly for Gemini 2.5 Flash Lite (Output)', () => {
      const cost = calculateCost(0, 1000000, 'gemini-2.5-flash-lite-preview-09-2025');
      expect(cost).toBeCloseTo(0.30, 5);
    });

    it('should return 0 and warn if model pricing is not defined', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const cost = calculateCost(1000, 1000, 'unknown-model');
      expect(cost).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('isBudgetAvailable', () => {
    it('should return true if currentCost is less than hardLimit', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ currentCost: 2.0, hardLimit: 5.0 })
      } as any);

      const available = await isBudgetAvailable();
      expect(available).toBe(true);
    });

    it('should return false if currentCost is equal to or greater than hardLimit', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ currentCost: 5.0, hardLimit: 5.0 })
      } as any);

      const available = await isBudgetAvailable();
      expect(available).toBe(false);
    });

    it('should return false if document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const available = await isBudgetAvailable();
      expect(available).toBe(false);
    });

    it('should return false and log error on exception', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(getDoc).mockRejectedValueOnce(new Error('Firestore error'));

      const available = await isBudgetAvailable();
      expect(available).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('updateCumulativeCost', () => {
    it('should call updateDoc with increment', async () => {
      await updateCumulativeCost(0.05);
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
        currentCost: 0.05
      });
    });

    it('should not call updateDoc if amount is 0', async () => {
      await updateCumulativeCost(0);
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should log error on updateDoc exception', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(updateDoc).mockRejectedValueOnce(new Error('Update failed'));

      await updateCumulativeCost(0.1);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
