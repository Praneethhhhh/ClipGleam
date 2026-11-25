'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { listProjects } from '../../lib/projects';
import { projectError, projectRequest } from './project-request';

type Page = Awaited<ReturnType<typeof listProjects>>;
type Languages = Record<Page['projects'][number]['language'], string>;

export function ProjectList({ initial, languages }: { initial: Page; languages: Languages }) {
  const [page, setPage] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [listError, setListError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const command = useRef<{ body: string; key: string } | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const body = JSON.stringify({ title: String(fields.get('title')).trim(), language: fields.get('language') });
    if (body !== command.current?.body) command.current = { body, key: crypto.randomUUID() };
    setCreating(true);
    setCreateError('');
    try {
      const result = await projectRequest('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': command.current.key },
        body,
      });
      location.assign('/dashboard/projects/' + result.data.id);
      return;
    } catch (error) {
      setCreateError(projectError(error));
    }
    setCreating(false);
  }

  async function loadMore() {
    if (!page.nextCursor) return;
    setLoading(true);
    setListError('');
    try {
      const result: { data: Page['projects']; meta: Pick<Page, 'nextCursor'> } =
        await projectRequest('?cursor=' + encodeURIComponent(page.nextCursor));
      setPage((current) => {
        const seen = new Set(current.projects.map(({ id }) => id));
        return {
          projects: [...current.projects, ...result.data.filter(({ id }) => !seen.has(id))],
          nextCursor: result.meta.nextCursor,
        };
      });
    } catch (error) {
      setListError(projectError(error));
    }
    setLoading(false);
  }

  return (
    <>
      <div className="project-heading">
        <div><h1>Projects</h1><p>Pick up where you left off or start a new video.</p></div>
        <button ref={createButton} className="primary-button" onClick={() => dialog.current?.showModal()}>
          New project
        </button>
      </div>
      {page.projects.length ? (
        <ul className="project-list">
          {page.projects.map((project) => (
            <li key={project.id}>
              <a href={'/dashboard/projects/' + project.id}>
                <h2>{project.title}</h2><p>{languages[project.language]} · Draft</p>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      ) : <div className="project-empty"><h2>No projects yet</h2><p>Create a project to start your first explainer.</p></div>}
      {listError && <p role="alert">{listError}</p>}
      {page.nextCursor && <button type="button" className="text-link" onClick={loadMore} disabled={loading}>
        {loading ? 'Loading…' : 'Load more'}
      </button>}
      <dialog ref={dialog} className="project-dialog" aria-labelledby="new-project-heading"
        onCancel={(event) => { if (creating) event.preventDefault(); }}
        onClose={() => { setCreateError(''); createButton.current?.focus(); }}>
        <h2 id="new-project-heading">New project</h2>
        <form className="access-form" onSubmit={create}>
          <label>Project title<input name="title" maxLength={120} required autoFocus /></label>
          <label>Video language<select name="language" defaultValue="en">
            {Object.entries(languages).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select></label>
          {createError && <p role="alert">{createError}</p>}
          <div className="project-actions">
            <button type="button" className="text-link" onClick={() => dialog.current?.close()} disabled={creating}>Cancel</button>
            <button className="primary-button" disabled={creating}>{creating ? 'Creating…' : 'Create project'}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
