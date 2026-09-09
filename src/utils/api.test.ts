// @ts-ignore
import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';

// Mock the firebase module before importing api
const mockAuth = {
  currentUser: null as any,
};

mock.module('../lib/firebase', () => {
  return {
    auth: mockAuth,
    googleProvider: {
      setCustomParameters: () => {},
    },
  };
});

import { api, request } from './api';

describe('src/utils/api', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockAuth.currentUser = null;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('defines syncSession and getHealth methods', () => {
    expect(typeof api.syncSession).toBe('function');
    expect(typeof api.getHealth).toBe('function');
  });

  it('makes a GET request to /health', async () => {
    let calledUrl = '';
    let calledOptions: any = null;

    global.fetch = mock((url: any, options: any) => {
      calledUrl = url.toString();
      calledOptions = options;
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));
    }) as any;

    const res = await api.getHealth();
    expect(res).toEqual({ status: 'ok' });
    expect(calledUrl).toContain('/api/health');
    expect(calledOptions.method).toBe('GET');
    expect(calledOptions.headers['Content-Type']).toBe('application/json');
    expect(calledOptions.headers['Authorization']).toBeUndefined();
  });

  it('makes a POST request to /auth/session with token when user is logged in', async () => {
    let calledUrl = '';
    let calledOptions: any = null;

    mockAuth.currentUser = {
      getIdToken: async () => 'mock-id-token',
    } as any;

    global.fetch = mock((url: any, options: any) => {
      calledUrl = url.toString();
      calledOptions = options;
      return Promise.resolve(new Response(JSON.stringify({ user: { uid: '123' }, role: 'player', isHost: false }), { status: 200 }));
    }) as any;

    const res = await api.syncSession();
    expect(res.user.uid).toBe('123');
    expect(calledUrl).toContain('/api/auth/session');
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.headers['Authorization']).toBe('Bearer mock-id-token');
  });

  it('handles 204 status response by returning undefined', async () => {
    global.fetch = mock(() => {
      return Promise.resolve(new Response(null, { status: 204 }));
    }) as any;

    const res = await request('/some-endpoint');
    expect(res).toBeUndefined();
  });

  it('throws an error when response is not OK', async () => {
    global.fetch = mock(() => {
      return Promise.resolve(new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401 }));
    }) as any;

    expect(api.getHealth()).rejects.toThrow('Unauthorized user');
  });
});
