import { describe, expect, test } from 'bun:test';
import { isAuthorizedRequest } from '@/lib/server-utils';

describe('isAuthorizedRequest', () => {
  test('accepts the configured bearer token', () => {
    const request = new Request('https://example.com', {
      headers: { authorization: 'Bearer test-secret' },
    });

    expect(isAuthorizedRequest(request, 'test-secret')).toBe(true);
  });

  test('rejects missing and incorrect bearer tokens', () => {
    const missing = new Request('https://example.com');
    const incorrect = new Request('https://example.com', {
      headers: { authorization: 'Bearer wrong-secret' },
    });

    expect(isAuthorizedRequest(missing, 'test-secret')).toBe(false);
    expect(isAuthorizedRequest(incorrect, 'test-secret')).toBe(false);
  });
});
