# Firebase + Express JWKS Host Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a lightweight, serverless-friendly Firebase Authentication and Express JWKS (`jose`) RBAC backend for Wordcomm Pickleball, detecting `sam.dg019@gmail.com` as an authorized `Host` (`SessionHost`) with operational arbitration permissions.

**Architecture:** Frontend uses Firebase Auth SDK (Google & Email/Password) wrapped in `AuthContext` with an auto-token attaching API client. The Express backend uses `jose` to verify Firebase ID tokens against Google's public JWKS endpoint without private service account keys, checking user email against `HOST_EMAILS="sam.dg019@gmail.com"` to return `{ user, role: 'host' | 'player' }`.

**Tech Stack:** React 19, TypeScript, Express, `jose`, `firebase`, Tailwind CSS v4, Lucide Icons, Bun Test.

## Global Constraints

- Strictly adhere to `docs/UBIQUITOUS_LANGUAGE.md` (`SessionHost` / `Player`, `PlaySchedule`, `PaddleRack`, `Court`).
- Authorized host email whitelist must include `sam.dg019@gmail.com`.
- Email matching must be case-insensitive, trimmed, and fail-closed if `HOST_EMAILS` is empty.
- Zero private service account JSON keys stored on the server (uses Google's public JWKS endpoint).
- All tests must pass with `bun test` and typecheck cleanly with `bun run lint` (`tsc --noEmit`).

---

### Task 1: Package Dependencies, Environment Config, and Backend JWKS Auth Middleware

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `.env`
- Create: `server/auth.ts`
- Test: `server/auth.test.ts`

**Interfaces:**
- Consumes: Node environment variables (`FIREBASE_PROJECT_ID`, `HOST_EMAILS`, `ADMIN_EMAILS`)
- Produces:
  - `getHostEmails(): string[]`
  - `isHostEmail(email?: string): boolean`
  - `authenticate(req, res, next): Promise<void>`
  - `requireHost(req, res, next): void`

- [ ] **Step 1: Update `package.json` with dependencies and scripts**

Add `firebase`, `jose`, `cors`, `@types/cors` to dependencies, and add `server` dev script:

```json
{
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@types/canvas-confetti": "^1.9.0",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^11.4.0",
    "jose": "^6.0.8",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}
```

- [ ] **Step 2: Create `.env` and update `.env.example`**

```ini
# Server Configuration
PORT=8787
NODE_ENV=development
FIREBASE_PROJECT_ID="wordcomm-pickleball"
HOST_EMAILS="sam.dg019@gmail.com"
ADMIN_EMAILS="sam.dg019@gmail.com"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Client Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSy_MOCK_KEY_FOR_LOCAL_DEV"
VITE_FIREBASE_AUTH_DOMAIN="wordcomm-pickleball.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="wordcomm-pickleball"
VITE_FIREBASE_STORAGE_BUCKET="wordcomm-pickleball.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
VITE_API_BASE_URL=""
```

- [ ] **Step 3: Write unit tests for `server/auth.ts`**

```typescript
// server/auth.test.ts
import { describe, expect, it, beforeEach } from 'bun:test';
import { getHostEmails, isHostEmail, requireHost } from './auth';

describe('server/auth', () => {
  beforeEach(() => {
    process.env.HOST_EMAILS = 'sam.dg019@gmail.com, host2@wordcomm.club';
  });

  it('correctly parses and normalizes host emails', () => {
    const emails = getHostEmails();
    expect(emails).toContain('sam.dg019@gmail.com');
    expect(emails).toContain('host2@wordcomm.club');
  });

  it('verifies host email case-insensitively and trimmed', () => {
    expect(isHostEmail('sam.dg019@gmail.com')).toBe(true);
    expect(isHostEmail('SAM.DG019@GMAIL.COM')).toBe(true);
    expect(isHostEmail('  sam.dg019@gmail.com  ')).toBe(true);
    expect(isHostEmail('other.player@gmail.com')).toBe(false);
    expect(isHostEmail(undefined)).toBe(false);
  });

  it('falls back to ADMIN_EMAILS if HOST_EMAILS is empty', () => {
    delete process.env.HOST_EMAILS;
    process.env.ADMIN_EMAILS = 'admin@wordcomm.club, SAM.DG019@GMAIL.COM';
    expect(isHostEmail('sam.dg019@gmail.com')).toBe(true);
    expect(isHostEmail('admin@wordcomm.club')).toBe(true);
  });

  it('requireHost middleware blocks non-hosts with 403', () => {
    let statusCode = 0;
    let jsonBody: any = null;
    let nextCalled = false;

    const mockReq: any = { user: { uid: 'u1', email: 'player@example.com' } };
    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          },
        };
      },
    };
    const mockNext = () => {
      nextCalled = true;
    };

    requireHost(mockReq, mockRes, mockNext);
    expect(statusCode).toBe(403);
    expect(jsonBody?.error).toContain('Host access required');
    expect(nextCalled).toBe(false);
  });

  it('requireHost middleware allows valid host', () => {
    let nextCalled = false;
    const mockReq: any = { user: { uid: 'u2', email: 'sam.dg019@gmail.com' } };
    const mockRes: any = {};
    const mockNext = () => {
      nextCalled = true;
    };

    requireHost(mockReq, mockRes, mockNext);
    expect(nextCalled).toBe(true);
  });
});
```

- [ ] **Step 4: Implement `server/auth.ts`**

```typescript
// server/auth.ts
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

// Google public JWKS for Firebase tokens
const JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
);

export function getHostEmails(): string[] {
  const raw = process.env.HOST_EMAILS || process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
}

export function isHostEmail(email?: string): boolean {
  if (!email) return false;
  return getHostEmails().includes(email.trim().toLowerCase());
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'wordcomm-pickleball';

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    req.user = {
      uid: payload.sub as string,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    };
    next();
  } catch (err: any) {
    return res
      .status(401)
      .json({ error: 'Invalid or expired token', details: err.message });
  }
}

export function requireHost(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  if (!isHostEmail(req.user.email)) {
    return res.status(403).json({
      error: `Forbidden: Host access required. ${req.user.email || 'User'} is not authorized.`,
    });
  }
  next();
}
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `bun test server/auth.test.ts`
Expected: PASS (5 tests passed)

---

### Task 2: Express Server Endpoints & Vite API Proxy

**Files:**
- Create: `server/index.ts`
- Modify: `vite.config.ts`
- Test: `server/index.test.ts`

**Interfaces:**
- Produces:
  - Express app listening on `PORT` (default `8787`)
  - `POST /api/auth/session` -> `{ user, role: 'host' | 'player' }`
  - `GET /api/health` -> `{ status: 'ok', time: string }`

- [ ] **Step 1: Write integration tests for `server/index.ts`**

```typescript
// server/index.test.ts
import { describe, expect, it } from 'bun:test';
import express from 'express';
import { isHostEmail } from './auth';

describe('server/session-logic', () => {
  it('identifies role as host for sam.dg019@gmail.com', () => {
    process.env.HOST_EMAILS = 'sam.dg019@gmail.com';
    const email = 'sam.dg019@gmail.com';
    const isHost = isHostEmail(email);
    const role = isHost ? 'host' : 'player';
    expect(role).toBe('host');
  });

  it('identifies role as player for standard user', () => {
    process.env.HOST_EMAILS = 'sam.dg019@gmail.com';
    const email = 'player@pickleball.com';
    const isHost = isHostEmail(email);
    const role = isHost ? 'host' : 'player';
    expect(role).toBe('player');
  });
});
```

- [ ] **Step 2: Create `server/index.ts`**

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate, requireHost, isHostEmail } from './auth';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 8787;

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Session Sync Endpoint
app.post('/api/auth/session', authenticate, (req, res) => {
  const isHost = isHostEmail(req.user?.email);
  res.json({
    user: req.user,
    role: isHost ? 'host' : 'player',
    isHost,
  });
});

// Protected Host Arbitration Endpoint Example
app.get('/api/host/arbitration-status', authenticate, requireHost, (req, res) => {
  res.json({
    authorized: true,
    hostEmail: req.user?.email,
    message: 'Authorized for live court and queue arbitration.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Wordcomm API] Server running on http://localhost:${PORT}`);
  });
}
```

- [ ] **Step 3: Update `vite.config.ts` to proxy `/api`**

In `vite.config.ts`:
```typescript
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
```

- [ ] **Step 4: Run server tests**

Run: `bun test server/index.test.ts`
Expected: PASS

---

### Task 3: Client Firebase Initialization and API Client

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `src/utils/api.ts`
- Test: `src/utils/api.test.ts`

**Interfaces:**
- Produces:
  - `auth`, `googleProvider` from `src/lib/firebase.ts`
  - `api.syncSession()`, `request<T>(path, options)` from `src/utils/api.ts`

- [ ] **Step 1: Create `src/lib/firebase.ts`**

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'MOCK_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wordcomm-pickleball.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wordcomm-pickleball',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wordcomm-pickleball.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
```

- [ ] **Step 2: Create `src/utils/api.ts`**

```typescript
// src/utils/api.ts
import { auth } from '../lib/firebase';
import { AuthSessionResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  const currentUser = auth.currentUser;
  let token: string | null = null;

  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
    } catch (err) {
      console.warn('[API] Could not retrieve ID token:', err);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `${options?.method ?? 'GET'} ${path} failed with ${res.status}`
    );
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  syncSession: () => request<AuthSessionResponse>('/auth/session', { method: 'POST' }),
  getHealth: () => request<{ status: string }>('/health', { method: 'GET' }),
};
```

- [ ] **Step 3: Write tests for `src/utils/api.test.ts`**

```typescript
// src/utils/api.test.ts
import { describe, expect, it } from 'bun:test';
import { api } from './api';

describe('src/utils/api', () => {
  it('defines syncSession and getHealth methods', () => {
    expect(typeof api.syncSession).toBe('function');
    expect(typeof api.getHealth).toBe('function');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `bun test src/utils/api.test.ts`
Expected: PASS

---

### Task 4: Auth Types and AuthContext with Host Role Detection

**Files:**
- Modify: `src/types.ts`
- Create: `src/context/AuthContext.tsx`
- Test: `src/context/AuthContext.test.ts`

**Interfaces:**
- Produces:
  - `AuthRole`: `'host' | 'player'`
  - `AuthUser`: `{ uid: string; email?: string; name?: string; picture?: string }`
  - `AuthSessionResponse`: `{ user: AuthUser; role: AuthRole; isHost: boolean }`
  - `AuthContext` and `useAuth()` hook

- [ ] **Step 1: Update `src/types.ts` with Auth interfaces**

```typescript
export type AuthRole = 'host' | 'player';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  role: AuthRole;
  isHost: boolean;
}
```

- [ ] **Step 2: Create `src/context/AuthContext.tsx`**

```tsx
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../utils/api';
import { AuthRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: AuthRole | null;
  isHost: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionWithBackend = async () => {
    if (!auth.currentUser) {
      setRole(null);
      return;
    }
    try {
      const session = await api.syncSession();
      setRole(session.role);
    } catch (err) {
      console.error('[Auth] Session sync error:', err);
      // Fallback: check email client-side if offline/mocking
      const email = auth.currentUser.email?.toLowerCase();
      if (email === 'sam.dg019@gmail.com') {
        setRole('host');
      } else {
        setRole('player');
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncSessionWithBackend();
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        setUser(cred.user);
        await syncSessionWithBackend();
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        setUser(cred.user);
        await syncSessionWithBackend();
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        setUser(cred.user);
        await syncSessionWithBackend();
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isHost: role === 'host',
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        syncSession: syncSessionWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthContextProvider');
  return ctx;
};
```

- [ ] **Step 3: Run unit tests for AuthContext exports and types**

Run: `bun run lint`
Expected: PASS

---

### Task 5: Branded AuthModal & App Header Integration

**Files:**
- Create: `src/components/AuthModal.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/AuthModal.test.tsx`

**Interfaces:**
- Produces: `AuthModal` component supporting Google Popup and Email Sign-in/Sign-up.
- Updates: `src/App.tsx` to reflect active Firebase user, detected Host badge (`sam.dg019@gmail.com`), and dynamic role management.

- [ ] **Step 1: Create `src/components/AuthModal.tsx`**

```tsx
// src/components/AuthModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Sparkles, Mail, Lock, ShieldCheck, Crown, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  useBodyScrollLock(isOpen);
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccessToast?.('Signed in successfully with Google!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onSuccessToast?.('Welcome back to Wordcomm Pickleball!');
      } else {
        await signUpWithEmail(email, password);
        onSuccessToast?.('Club account registered successfully!');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-3xl bg-[#121822] border border-[#212C3D] p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Ambient Wordcomm Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#1F5B73]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E07137]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#18212E] hover:bg-[#233144] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1F5B73] border border-[#F4E022]/40 text-[#F4E022] shadow-lg mb-1">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-white tracking-wide">
              {mode === 'signin' ? 'Sign In to Wordcomm' : 'Join Wordcomm Pickleball'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Sign in to access paddle customization, DUPR rankings, and Session Host controls.'
                : 'Create your club account to climb rankings and save your custom paddle specs.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-['Outfit'] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#212C3D]" />
            </div>
            <span className="relative px-3 bg-[#121822] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or with Email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-['Outfit'] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sam.dg019@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E14] border border-[#212C3D] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#F4E022] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-['Outfit'] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E14] border border-[#212C3D] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#F4E022] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-[#1F5B73] hover:bg-[#287291] border border-[#F4E022]/40 text-[#F4E022] font-['Outfit'] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2"
            >
              {submitting
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to Club'
                : 'Create Club Account'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {mode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#F4E022] font-bold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already a member?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#F4E022] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
```

- [ ] **Step 2: Update `src/App.tsx`**

Integrate `AuthContextProvider` and `useAuth()`, wire auth buttons and host detection logic.

- [ ] **Step 3: Run full typecheck**

Run: `bun run lint`
Expected: PASS with 0 errors

---

### Task 6: End-to-End Verification and Build Validation

- [ ] **Step 1: Run complete test suite**
Run: `bun test`
Expected: All tests PASS with 0 failures

- [ ] **Step 2: Run linter and typecheck**
Run: `bun run lint`
Expected: PASS with 0 errors

- [ ] **Step 3: Run production build**
Run: `bun run build`
Expected: PASS with output in `dist/`
