export class AssertionError extends Error {
  constructor(message: string) {
    super(`Assertion failed: ${message}`);
    this.name = 'AssertionError';
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

export function assertNonNull<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AssertionError(message);
  }
}

export function assertNonEmpty(
  value: string | unknown[],
  message: string
): void {
  assert(value.length > 0, message);
}

export function assertValidString(value: unknown, message: string): asserts value is string {
  assert(typeof value === 'string', message);
  assert(value.trim().length > 0, `${message} (string is empty or whitespace)`);
}
