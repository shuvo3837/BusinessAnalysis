export function resolveServerPort(portInput: string | number | undefined, fallbackPort: number): number {
  const candidate = typeof portInput === 'string' ? portInput.trim() : portInput;

  if (typeof candidate === 'number' && Number.isInteger(candidate) && candidate > 0) {
    return candidate;
  }

  if (typeof candidate === 'string') {
    const parsed = Number(candidate);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallbackPort;
}

export function resolveServerHost(hostInput: string | undefined, fallbackHost: string): string {
  const candidate = typeof hostInput === 'string' ? hostInput.trim() : '';

  if (!candidate) {
    return fallbackHost;
  }

  if (candidate === '0.0.0.0' || candidate === '::' || candidate === '[::]') {
    return fallbackHost;
  }

  return candidate;
}
