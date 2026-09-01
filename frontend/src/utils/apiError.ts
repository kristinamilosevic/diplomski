const backendDetailToKey: Record<string, string> = {
  'Email already registered': 'errors.emailTaken',
  'Current password is incorrect': 'errors.wrongPassword',
};

export function translateApiDetail(
  detail: unknown,
  t: (key: string) => string,
  fallbackKey:
    | 'errors.loginFailed'
    | 'errors.registerFailed'
    | 'errors.passwordChangeFailed' = 'errors.registerFailed'
): string {
  if (typeof detail !== 'string') {
    return t(fallbackKey);
  }
  const key = backendDetailToKey[detail];
  return key ? t(key) : detail;
}
