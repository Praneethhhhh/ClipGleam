'use client';

import { useState } from 'react';
import type { Brief, briefLimits } from '../../../../lib/brief';
import type { getProject } from '../../../../lib/projects';
import { BriefEditor } from './brief-editor';
import { ProjectSettings } from './project-settings';

type Project = NonNullable<Awaited<ReturnType<typeof getProject>>>;

export function ProjectWorkspace({ project, brief, language, limits }: {
  project: Project; brief: Brief; language: string; limits: typeof briefLimits;
}) {
  const [section, setSection] = useState<'plan' | 'settings'>('plan');
  const [title, setTitle] = useState(project.title);
  return (
    <>
      <a className="text-link" href="/dashboard">← All projects</a>
      <div className="project-heading"><div><h1>{title}</h1><p>{language} · Draft</p></div></div>
      <nav className="project-sections" aria-label="Project workspace">
        <button type="button" aria-pressed={section === 'plan'} onClick={() => setSection('plan')}>Plan</button>
        <button type="button" aria-pressed={section === 'settings'} onClick={() => setSection('settings')}>Settings</button>
      </nav>
      <section hidden={section !== 'plan'} aria-label="Video plan">
        <BriefEditor initial={brief} projectId={project.id} limits={limits} />
      </section>
      <section hidden={section !== 'settings'} aria-label="Project settings" className="workspace-settings">
        <ProjectSettings initial={project} onRename={setTitle} />
      </section>
    </>
  );
}
