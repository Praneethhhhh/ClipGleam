export async function projectRequest(path: string, init?: RequestInit) {
  const response = await fetch('/api/v1/projects' + path, init);
  if (response.status === 401) {
    location.assign('/sign-in');
    throw new Error('Sign in to continue.');
  }
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Could not complete the request.');
  return result;
}

export function projectError(error: unknown) {
  return error instanceof Error ? error.message : 'Could not complete the request.';
}
