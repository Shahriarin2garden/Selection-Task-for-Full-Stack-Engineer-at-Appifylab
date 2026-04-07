type LoginAttemptState = {
  count: number;
  windowStart: number;
  lockedUntil?: number;
};

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const globalState = globalThis as unknown as {
  loginAttempts?: Map<string, LoginAttemptState>;
};

const attempts = globalState.loginAttempts ?? new Map<string, LoginAttemptState>();
if (!globalState.loginAttempts) {
  globalState.loginAttempts = attempts;
}

export function isLoginRateLimited(key: string): boolean {
  const state = attempts.get(key);
  if (!state) return false;

  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    return true;
  }

  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    attempts.delete(key);
  }

  return false;
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || now - current.windowStart > ATTEMPT_WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return;
  }

  const nextCount = current.count + 1;
  const nextState: LoginAttemptState = {
    count: nextCount,
    windowStart: current.windowStart,
  };

  if (nextCount >= MAX_ATTEMPTS) {
    nextState.lockedUntil = now + LOCKOUT_MS;
  }

  attempts.set(key, nextState);
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}