import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPilotUser } from '../../lib/auth';
import { listProjects, projectLanguages } from '../../lib/projects';
import { isOwnerAdmin } from '../../lib/invitations';
import { ProjectList } from './project-list';

export const metadata = { title: 'Projects | ClipGleam' };

export default async function Dashboard() {
  const requestHeaders = await headers();
  let initial;
  let owner = false;
  try {
    const user = requestHeaders.get('cookie') ? await getPilotUser(requestHeaders) : null;
    initial = user ? await listProjects(user.id) : null;
    owner = !!user && isOwnerAdmin(user.id);
  } catch {
    return <div className="project-empty">
      <h1>Projects unavailable</h1>
      <p>We could not load your projects. Please try again in a moment.</p>
      <a className="text-link" href="/dashboard">Try again</a>
    </div>;
  }
  if (!initial) redirect('/sign-in');
  return <>
    {owner && <a className="text-link" href="/dashboard/invitations">Manage invitations</a>}
    <ProjectList initial={initial} languages={projectLanguages} />
  </>;
}
