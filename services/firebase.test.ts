import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({}),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue({}),
}));

describe('firebase service', () => {
  it('should initialize firebase and firestore', async () => {
    const { db } = await import('./firebase');
    expect(db).toBeDefined();
  });
});
