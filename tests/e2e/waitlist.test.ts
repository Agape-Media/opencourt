import { describe, expect, test } from 'bun:test';

const baseUrl = process.env.WAITLIST_TEST_BASE_URL;

describe.skipIf(!baseUrl)('production waitlist API', () => {
  test('rejects invalid email addresses without creating a signup', async () => {
    const response = await fetch(`${baseUrl}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      message: 'Invalid email address',
    });
  });

  test('protects administrative email endpoints', async () => {
    const singleResponse = await fetch(`${baseUrl}/api/send-launch-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const batchResponse = await fetch(`${baseUrl}/api/send-launch-emails`, {
      method: 'POST',
    });

    expect(singleResponse.status).toBe(401);
    expect(batchResponse.status).toBe(401);
  });
});
