import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass a simple assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const str = 'hello';
    expect(str.toUpperCase()).toBe('HELLO');
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
