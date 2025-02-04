import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/auth/callback/route';

const mockExchangeSuccess = async (code: string) => ({ error: null });
const mockExchangeFailure = async (code: string) => ({
  error: { message: 'exchange error' },
});

vi.mock('@/utils/supabase/server', () => {
  return {
    createClientForServer: async () => ({
      auth: {
        exchangeCodeForSession: mockExchangeSuccess,
      },
    }),
  };
});

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to next URL when code exchange is successful', async () => {
    const url = 'http://localhost/auth/callback?code=abc123&next=/dashboard';
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('redirects to auth-code-error when exchange fails', async () => {
    // Override the mock for failure.
    (vi.mocked(await import('@/utils/supabase/server'))
      .createClientForServer as any) = async () => ({
      auth: { exchangeCodeForSession: mockExchangeFailure },
    });
    const url = 'http://localhost/auth/callback?code=abc123';
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/auth/auth-code-error'
    );
  });

  it('redirects to auth-code-error when no code is provided', async () => {
    const url = 'http://localhost/auth/callback';
    const request = new Request(url);
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/auth/auth-code-error'
    );
  });
});
