import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getOwnerAdmin, listInvitations } from '../../../lib/invitations';
import { InvitationManager } from './invitation-manager';

export const metadata = { title: 'Invitations | ClipGleam' };

export default async function InvitationsPage() {
  const owner = await getOwnerAdmin(await headers());
  if (!owner) notFound();
  try {
    return <InvitationManager invitations={await listInvitations()} />;
  } catch {
    return <div className="project-empty">
      <h1>Invitations unavailable</h1>
      <p>Try again in a moment.</p>
      <a className="text-link" href="/dashboard">Back to projects</a>
    </div>;
  }
}
