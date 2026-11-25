'use client';

import { useEffect, useState, type FormEvent } from 'react';

export function AcceptInvite() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const fragment = location.hash.slice(1);
    if (/^[A-Za-z0-9_-]{43}$/.test(fragment)) setToken(fragment);
    setLoading(false);
  }, []);

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (fields.get('password') !== fields.get('confirmPassword')) {
      setError('The passwords do not match.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const response = await fetch('/api/invitations/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: fields.get('name'), password: fields.get('password') }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      history.replaceState(history.state, '', location.pathname);
      setToken(null);
      setAccepted(true);
      form.reset();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not accept the invitation.');
    } finally { setWorking(false); }
  }

  if (loading) return <p role="status">Opening invitation…</p>;
  if (accepted) return <><p role="status">Your account is ready.</p><a className="primary-button" href="/sign-in">Go to sign in</a></>;
  if (!token) return <p>Open the complete invitation link from the owner to set up your account.</p>;

  return <form className="access-form invite-accept" method="post" onSubmit={accept}>
    <p>Choose a display name and password for the email address on your invitation.</p>
    <label>Display name<input name="name" autoComplete="name" required maxLength={120} /></label>
    <label>Password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
    <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password"
      required minLength={12} maxLength={128} /></label>
    {error && <div><p role="alert">{error}</p><a className="text-link" href="/sign-in">Already set your password? Sign in</a></div>}
    <button className="primary-button" disabled={working}>{working ? 'Creating account…' : 'Create account'}</button>
  </form>;
}
