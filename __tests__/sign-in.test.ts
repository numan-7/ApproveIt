import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithGoogle } from '@/utils/utils';
import { createClientForServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

vi.mock('@/utils/supabase/server', () => ({
  createClientForServer: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('utils/utils.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signInWithGoogle - success with data.url', async () => {
    vi.mocked(createClientForServer).mockResolvedValueOnce({
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValueOnce({
          data: { url: 'http://test-url.com' },
          error: null,
        }),
      },
    } as any);

    await signInWithGoogle();
    expect(redirect).toHaveBeenCalledWith('http://test-url.com');
  });

  it('signInWithGoogle - data.url is null', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(createClientForServer).mockResolvedValueOnce({
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValueOnce({
          data: { url: null },
          error: null,
        }),
      },
    } as any);

    await signInWithGoogle();
    expect(consoleError).toHaveBeenCalledWith('Error: data.url is null');
    consoleError.mockRestore();
  });

  it('signInWithGoogle - error occurs', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(createClientForServer).mockResolvedValueOnce({
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Some error' },
        }),
      },
    } as any);

    await signInWithGoogle();
    expect(consoleError).toHaveBeenCalledWith(
      'Error signing in with google:',
      'Some error'
    );
    consoleError.mockRestore();
  });
});
