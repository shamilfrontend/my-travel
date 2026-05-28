export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function mockDelay<T>(data: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
