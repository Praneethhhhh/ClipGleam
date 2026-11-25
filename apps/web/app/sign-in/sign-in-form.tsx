'use client';

import { useState, type FormEvent } from 'react';

export function SignInForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.get('email'), password: fields.get('password') }),
      });
      if (response.ok) {
        location.assign('/dashboard');
        return;
      }
      setError(response.status === 429 ? 'Too many attempts. Wait a moment and try again.' :
        response.status === 401 ? 'Unable to sign in with those credentials.' :
          'Sign-in is temporarily unavailable. Please try again.');
    } catch {
      setError('Sign-in is temporarily unavailable. Please try again.');
    }
    setPending(false);
  }

  return (
    <form className="access-form" method="post" onSubmit={submit}>
      <label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={128} required /></label>
      {error && <p role="alert">{error}</p>}
      <button className="primary-button" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
