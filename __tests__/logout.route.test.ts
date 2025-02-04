import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/auth/logout/route';

const mockSignOutSuccess = async () => ({ error: null });
const mockSignOutFailure = async () => ({
  error: { message: 'failed sign out' },
});

vi.mock('@/utils/supabase/server', () => {
  return {
    createClientForServer: async () =>
      ({
        auth: {
          signOut: mockSignOutSuccess,
        },
      }) as any,
  };
});

describe('GET /auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to "/" on successful sign out', async () => {
    const request = new Request('http://localhost/auth/logout');
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/');
  });

  it('returns error JSON on failed sign out', async () => {
    (vi.mocked(await import('@/utils/supabase/server'))
      .createClientForServer as any) = async () => ({
      auth: { signOut: mockSignOutFailure },
    });
    const request = new Request('http://localhost/auth/logout');
    const response = await GET(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to sign out');
  });
});
