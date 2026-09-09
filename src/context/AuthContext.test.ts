// @ts-ignore
import { describe, expect, it, beforeEach, afterAll, mock } from 'bun:test';

// Set up mocks for React hooks
let stateIndex = 0;
const states: any[] = [];
const stateSetters: any[] = [];
let effectCallback: (() => any) | undefined = undefined;
let unsubscribeSpy = mock(() => {});

function resetMockHooks() {
  stateIndex = 0;
  states.length = 0;
  stateSetters.length = 0;
  effectCallback = undefined;
  unsubscribeSpy = mock(() => {});
}

// Mock react before importing any code that uses it
mock.module('react', () => {
  return {
    createContext: () => ({
      Provider: ({ children, value }: any) => ({ props: { children, value } }),
    }),
    useContext: (ctx: any) => {
      return null;
    },
    useState: (initialValue: any) => {
      const currentIndex = stateIndex++;
      if (states[currentIndex] === undefined) {
        states[currentIndex] = initialValue;
      }
      const setter = (newValue: any) => {
        if (typeof newValue === 'function') {
          states[currentIndex] = newValue(states[currentIndex]);
        } else {
          states[currentIndex] = newValue;
        }
      };
      stateSetters[currentIndex] = setter;
      return [states[currentIndex], setter];
    },
    useEffect: (callback: () => any, deps?: any[]) => {
      if (!deps || deps.length === 0) {
        effectCallback = callback;
      }
    },
  };
});

// Mock firebase/auth
const mockFirebaseAuth = {
  onAuthStateChanged: mock((auth: any, callback: any) => {
    callback(mockAuth.currentUser);
    return unsubscribeSpy;
  }),
  signInWithPopup: mock(async (auth: any, provider: any) => {
    mockAuth.currentUser = { uid: 'google-uid', email: 'sam.dg019@gmail.com' } as any;
    return { user: mockAuth.currentUser };
  }),
  signOut: mock(async (auth: any) => {
    mockAuth.currentUser = null;
  }),
  signInWithEmailAndPassword: mock(async (auth: any, email: any, pass: any) => {
    mockAuth.currentUser = { uid: 'email-uid', email } as any;
    return { user: mockAuth.currentUser };
  }),
  createUserWithEmailAndPassword: mock(async (auth: any, email: any, pass: any) => {
    mockAuth.currentUser = { uid: 'new-email-uid', email } as any;
    return { user: mockAuth.currentUser };
  }),
};

mock.module('firebase/auth', () => mockFirebaseAuth);

// Mock ../lib/firebase
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

// Import api to spy/override instead of mock.module
import { api } from '../utils/api';

const originalSyncSession = api.syncSession;
const mockSyncSession = mock(async () => {
  return { user: { uid: 'some-uid' }, role: 'player' as const, isHost: false };
});

// Overwrite the syncSession method directly on the imported api object
api.syncSession = mockSyncSession;

// Import AuthContext after mocking
import { AuthContextProvider } from './AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    resetMockHooks();
    mockAuth.currentUser = null;
    mockSyncSession.mockClear();
    mockSyncSession.mockImplementation(async () => {
      return { user: { uid: 'some-uid' }, role: 'player' as const, isHost: false };
    });
    mockFirebaseAuth.onAuthStateChanged.mockClear();
    mockFirebaseAuth.signInWithPopup.mockClear();
    mockFirebaseAuth.signOut.mockClear();
    mockFirebaseAuth.signInWithEmailAndPassword.mockClear();
    mockFirebaseAuth.createUserWithEmailAndPassword.mockClear();
  });

  afterAll(() => {
    // Restore original syncSession so we don't pollute other tests
    api.syncSession = originalSyncSession;
  });

  function renderProvider() {
    stateIndex = 0;
    const element: any = AuthContextProvider({ children: 'test-children' });
    return element.props.value;
  }

  it('initializes with loading: true and null user/role', () => {
    const ctx = renderProvider();
    expect(ctx.user).toBeNull();
    expect(ctx.role).toBeNull();
    expect(ctx.isHost).toBe(false);
    expect(ctx.loading).toBe(true);
  });

  it('registers onAuthStateChanged on mount and unsubscribes on unmount', () => {
    renderProvider();
    expect(effectCallback).toBeDefined();
    
    // Trigger effect
    const cleanup = effectCallback!();
    expect(mockFirebaseAuth.onAuthStateChanged).toHaveBeenCalled();
    
    // Trigger cleanup
    cleanup();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('signs in with Google successfully and syncs session', async () => {
    const ctx = renderProvider();
    await ctx.signInWithGoogle();
    
    expect(mockFirebaseAuth.signInWithPopup).toHaveBeenCalled();
    expect(mockSyncSession).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.user).toEqual({ uid: 'google-uid', email: 'sam.dg019@gmail.com' });
    expect(updatedCtx.role).toBe('player');
    expect(updatedCtx.isHost).toBe(false);
  });

  it('signs in with email and password successfully and syncs session', async () => {
    const ctx = renderProvider();
    await ctx.signInWithEmail('test@example.com', 'password123');
    
    expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123');
    expect(mockSyncSession).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.user?.email).toBe('test@example.com');
  });

  it('signs up with email and password successfully and syncs session', async () => {
    const ctx = renderProvider();
    await ctx.signUpWithEmail('new@example.com', 'password123');
    
    expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'new@example.com', 'password123');
    expect(mockSyncSession).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.user?.email).toBe('new@example.com');
  });

  it('signs out successfully', async () => {
    mockAuth.currentUser = { uid: 'user-123' };
    const ctx = renderProvider();
    await ctx.signOut();
    
    expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.user).toBeNull();
    expect(updatedCtx.role).toBeNull();
    expect(updatedCtx.isHost).toBe(false);
  });

  it('falls back to local email check if backend sync fails (host case)', async () => {
    // Mock syncSession to throw an error
    mockSyncSession.mockImplementationOnce(async () => {
      throw new Error('Network error');
    });

    mockAuth.currentUser = { uid: 'sam-uid', email: 'sam.dg019@gmail.com' } as any;
    const ctx = renderProvider();
    await ctx.syncSession();
    
    expect(mockSyncSession).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.role).toBe('host');
    expect(updatedCtx.isHost).toBe(true);
  });

  it('falls back to local email check if backend sync fails (player case)', async () => {
    // Mock syncSession to throw an error
    mockSyncSession.mockImplementationOnce(async () => {
      throw new Error('Network error');
    });

    mockAuth.currentUser = { uid: 'player-uid', email: 'player@example.com' } as any;
    const ctx = renderProvider();
    await ctx.syncSession();
    
    expect(mockSyncSession).toHaveBeenCalled();
    
    const updatedCtx = renderProvider();
    expect(updatedCtx.role).toBe('player');
    expect(updatedCtx.isHost).toBe(false);
  });
});
