const backendDetailToKey: Record<string, string> = {
  'Email already registered': 'errors.emailTaken',
  'Invalid email or password': 'errors.invalidCredentials',
};

export function translateApiDetail(
  detail: unknown,
  t: (key: string) => string,
  fallbackKey: 'errors.loginFailed' | 'errors.registerFailed' = 'errors.registerFailed'
): string {
  if (typeof detail !== 'string') {
    return t(fallbackKey);
  }
  const key = backendDetailToKey[detail];
  return key ? t(key) : detail;
}
