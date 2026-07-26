export function validateIdentifier(value: string) {
  return value.trim().length > 0;
}

export function validatePassword(value: string) {
  return value.length >= 6;
}

export function getAuthError({
  identifier,
  password,
  name,
}: {
  identifier: string;
  password: string;
  name?: string;
}) {
  if (name !== undefined && name.trim().length === 0) {
    return 'Enter your full name.';
  }

  if (!validateIdentifier(identifier)) {
    return 'Enter your email or phone.';
  }

  if (!validatePassword(password)) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}
