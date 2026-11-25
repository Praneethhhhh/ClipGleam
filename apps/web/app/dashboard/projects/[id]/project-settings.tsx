'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { getProject } from '../../../../lib/projects';
import { projectError, projectRequest } from '../../project-request';

type Project = NonNullable<Awaited<ReturnType<typeof getProject>>>;

export function ProjectSettings({ initial, language }: { initial: Project; language: string }) {
  const [project, setProject] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const back = '/dashboard';
  const path = '/' + project.id;

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');
    try {
      const result = await projectRequest(path, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, revision: project.revision }),
      });
      setProject(result.data);
      setTitle(result.data.title);
      setNotice('Project name saved.');
    } catch (error) {
      setError(projectError(error));
    }
    setPending(false);
  }

  async function remove() {
    setPending(true);
    setDeleteError('');
    try {
      await projectRequest(path, { method: 'DELETE', headers: { 'If-Match': '"' + project.revision + '"' } });
      location.replace(back);
      return;
    } catch (error) {
      setDeleteError(projectError(error));
    }
    setPending(false);
  }

  return (
    <>
      <a className="text-link" href={back}>← All projects</a>
      <div className="project-heading">
        <div><h1>{project.title}</h1><p>{language} · Draft</p></div>
      </div>
      <form className="access-form rename-form" onSubmit={rename}>
        <label>Project title<input value={title} onChange={(event) => setTitle(event.target.value)}
          maxLength={120} readOnly={pending} required /></label>
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="project-actions">
          <button className="primary-button" disabled={pending || !title.trim() || title.trim() === project.title}>
            {pending ? 'Working…' : 'Save name'}
          </button>
          <button ref={deleteButton} type="button" className="text-link project-danger"
            disabled={pending} onClick={() => dialog.current?.showModal()}>Delete project</button>
        </div>
      </form>
      <dialog ref={dialog} className="project-dialog" aria-labelledby="delete-project-heading"
        onCancel={(event) => { if (pending) event.preventDefault(); }}
        onClose={() => { setDeleteError(''); deleteButton.current?.focus(); }}>
        <h2 id="delete-project-heading">Delete this project?</h2>
        <p>“{project.title}” will be removed from your projects. This cannot be undone.</p>
        {deleteError && <p role="alert">{deleteError}</p>}
        <div className="project-actions">
          <button className="text-link" disabled={pending} onClick={() => dialog.current?.close()} autoFocus>Cancel</button>
          <button className="primary-button project-delete" disabled={pending} onClick={remove}>
            {pending ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </dialog>
    </>
  );
}
