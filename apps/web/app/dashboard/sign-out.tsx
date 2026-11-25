'use client';

import { useState } from 'react';

export function SignOut() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signOut() {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      if (response.ok) {
        location.replace('/sign-in');
        return;
      }
    } catch {
      // Keep the control available so the creator can retry.
    }
    setFailed(true);
    setBusy(false);
  }
  return <div><button className="primary-button" onClick={signOut} disabled={busy}>
    {busy ? 'Signing out…' : 'Sign out'}
  </button>{failed && <p role="alert">Could not sign out. Please try again.</p>}</div>;
}
