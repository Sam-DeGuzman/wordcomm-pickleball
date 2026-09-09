// @ts-ignore
import { describe, expect, it } from 'bun:test';
import { formatScheduleRemainingTime } from '../utils/hostPermissions';

describe('formatScheduleRemainingTime', () => {
  it('formats future end time with hours and minutes correctly', () => {
    // 1 hour and 30 minutes in the future
    const futureTime = new Date(Date.now() + 90 * 60 * 1000 + 1000).toISOString();
    const result = formatScheduleRemainingTime(futureTime);
    expect(result).toBe('1h 30m remaining');
  });

  it('formats future end time with multiple hours and minutes correctly', () => {
    // 3 hours and 15 minutes in the future
    const futureTime = new Date(Date.now() + (3 * 60 + 15) * 60 * 1000 + 1000).toISOString();
    const result = formatScheduleRemainingTime(futureTime);
    expect(result).toBe('3h 15m remaining');
  });

  it('formats future end time with less than one hour as minutes only', () => {
    // 45 minutes in the future
    const futureTime = new Date(Date.now() + 45 * 60 * 1000 + 1000).toISOString();
    const result = formatScheduleRemainingTime(futureTime);
    expect(result).toBe('45m remaining');
  });

  it('returns "Session Concluded" for past end times', () => {
    // 10 minutes in the past
    const pastTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatScheduleRemainingTime(pastTime)).toBe('Session Concluded');
  });

  it('returns "Session Concluded" for current or zero diff time', () => {
    const currentTime = new Date(Date.now()).toISOString();
    expect(formatScheduleRemainingTime(currentTime)).toBe('Session Concluded');
  });

  it('returns "Session Concluded" for invalid timestamp strings', () => {
    expect(formatScheduleRemainingTime('invalid-iso-date')).toBe('Session Concluded');
    expect(formatScheduleRemainingTime('')).toBe('Session Concluded');
  });
});
