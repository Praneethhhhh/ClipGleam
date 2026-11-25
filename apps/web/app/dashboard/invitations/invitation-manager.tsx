'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { listInvitations } from '../../../lib/invitations';

export function InvitationManager({ invitations }: { invitations: Awaited<ReturnType<typeof listInvitations>> }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [link, setLink] = useState<{ id: string; url: string } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  async function issue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get('email');
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setLink({ id: result.id, url: result.url });
      setNotice('Invitation created.');
      form.reset();
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create the invitation.');
    } finally { setWorking(false); }
  }

  async function revoke(id: string) {
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/invitations/' + id, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message);
      setLink((current) => current?.id === id ? null : current);
      setNotice('Invitation revoked.');
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not revoke the invitation.');
    } finally { setWorking(false); setConfirm(null); }
  }

  return (
    <div className="invitation-panel">
      <a className="text-link" href="/dashboard">← All projects</a>
      <div className="project-heading"><div><h1>Invitations</h1><p>Invite someone to create videos in their own workspace.</p></div></div>
      <form className="access-form invite-form" onSubmit={issue}>
        <label>Email address<input type="email" name="email" required maxLength={254} autoComplete="off" /></label>
        <button className="primary-button" disabled={working}>{working ? 'Working…' : 'Create invitation'}</button>
      </form>
      {error && <p className="brief-error" role="alert">{error}</p>}
      {notice && <p className="invite-notice" role="status">{notice}</p>}
      {link && <div className="brief-summary invite-link">
        <label className="access-form">Invitation link<input type="text" value={link.url} readOnly /></label>
        <p>Share this link directly. It can be used once and expires in 72 hours.</p>
        <button className="primary-button" onClick={async () => {
          try {
            await navigator.clipboard.writeText(link.url);
            setNotice('Link copied.');
          } catch { setNotice('Select and copy the link above.'); }
        }}>Copy link</button>
      </div>}
      <section className="invite-history" aria-labelledby="recent-invites">
        <h2 id="recent-invites">Recent invitations</h2>
        {invitations.length ? (
          <ul className="invite-rows">
            {invitations.map((invite) => <li key={invite.id}>
              <div><strong>{invite.email}</strong><p>{invite.status}</p></div>
              {invite.status === 'pending' && (confirm === invite.id ? <div className="project-actions">
                <button className="text-link" onClick={() => setConfirm(null)} disabled={working}>Cancel</button>
                <button className="primary-button project-delete" onClick={() => void revoke(invite.id)} disabled={working}>Confirm revoke</button>
              </div> : <button className="text-link project-danger invite-revoke" onClick={() => setConfirm(invite.id)}
                disabled={working} aria-label={'Revoke invitation for ' + invite.email}>Revoke</button>)}
            </li>)}
          </ul>
        ) : <p>No invitations yet.</p>}
      </section>
    </div>
  );
}
