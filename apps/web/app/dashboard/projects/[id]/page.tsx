import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getPilotUser } from '../../../../lib/auth';
import { getProject, projectId, projectLanguages } from '../../../../lib/projects';
import { ProjectSettings } from './project-settings';

export const metadata = { title: 'Project | ClipGleam' };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const requestHeaders = await headers();
  const { id } = await params;
  let user;
  let project;
  try {
    user = requestHeaders.get('cookie') ? await getPilotUser(requestHeaders) : null;
    project = user && projectId.safeParse(id).success ? await getProject(user.id, id) : null;
  } catch {
    return <div className="project-empty">
      <h1>Project temporarily unavailable</h1>
      <p>We could not load this project. Please try again in a moment.</p>
      <a className="text-link" href="/dashboard">All projects</a>
    </div>;
  }
  if (!user) redirect('/sign-in');
  if (!project) notFound();
  return <ProjectSettings initial={project} language={projectLanguages[project.language]} />;
}
