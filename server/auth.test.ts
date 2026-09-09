// @ts-ignore
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
