'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Brief, BriefFields, briefLimits } from '../../../../lib/brief';

type Limits = typeof briefLimits;
const fields = ['topic', 'audience', 'learningObjective', 'sourceText', 'targetSeconds'] as const;
function sameBrief(a: BriefFields, b: BriefFields) {
  return fields.every((key) => a[key] === b[key]);
}

function changedFields(draft: BriefFields, base: BriefFields) {
  return Object.fromEntries(fields.filter((key) => draft[key] !== base[key]).map((key) => [key, draft[key]]));
}

export function BriefEditor({ projectId, initial, limits }: { projectId: string; initial: Brief; limits: Limits }) {
  const [base, setBase] = useState(initial);
  const [draft, setDraft] = useState<BriefFields>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState<{ current: Brief; submitted: BriefFields } | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<{ submitted: BriefFields; base: Brief } | null>(null);
  const active = useRef(false);
  const dirty = !sameBrief(draft, base);
  const pending = dirty || !!unconfirmed || !!conflict;
  const endpoint = '/api/v1/projects/' + projectId + '/brief';

  const save = useCallback(async () => {
    if (active.current || !pending || conflict) return;
    const request = unconfirmed ?? { submitted: draft, base };
    setUnconfirmed(request);
    active.current = true;
    setSaving(true);
    setError('');
    try {
      const changes = changedFields(request.submitted, request.base);
      const response = await fetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedRevision: request.base.revision, ...changes }),
      });
      if (response.status === 401) {
        throw new Error('Your session expired. Sign in again in another tab, then retry here.');
      }
      const result = await response.json();
      if (response.status === 409) {
        const current: Brief = result.data;
        setUnconfirmed(null);
        if (sameBrief(request.submitted, current) || sameBrief(draft, current)) setBase(current);
        else setConflict({ current, submitted: request.submitted });
      } else if (response.ok) {
        setUnconfirmed(null);
        setBase(result.data);
      } else {
        throw new Error(result.error?.message || 'Could not save your plan. Please try again.');
      }
    } catch (failure) {
      setError(failure instanceof Error && failure.message !== 'Failed to fetch'
        ? failure.message : 'Could not reach ClipGleam. Your edits are still here. Retry when connected.');
    } finally {
      active.current = false;
      setSaving(false);
    }
  }, [base, conflict, draft, endpoint, pending, unconfirmed]);

  useEffect(() => {
    if (!dirty || saving || error || conflict) return;
    const timeout = window.setTimeout(() => void save(), 700);
    return () => window.clearTimeout(timeout);
  }, [conflict, dirty, error, save, saving]);

  useEffect(() => {
    if (!pending) return;
    function protect(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [pending]);

  const hasTopic = !!draft.topic.trim();
  const hasObjective = !!draft.learningObjective.trim();
  return (
    <div className="brief-workspace">
      <div className="brief-main">
        <div className="brief-heading"><h2>Plan your video</h2>
          <p>Decide what the viewer should understand by the end.</p></div>
        <div className="access-form">
          <label>Video topic
            <input value={draft.topic} maxLength={limits.topic} placeholder="Why do we get seasons?"
              onChange={(event) => setDraft({ ...draft, topic: event.target.value })} />
          </label>
          <label>Audience <small>Optional</small>
            <input value={draft.audience} maxLength={limits.audience} placeholder="Curious 10-year-olds"
              onChange={(event) => setDraft({ ...draft, audience: event.target.value })} />
          </label>
          <label>Learning objective
            <textarea value={draft.learningObjective} maxLength={limits.learningObjective} rows={3}
              placeholder="Explain how Earth’s tilt changes daylight and sunlight intensity."
              onChange={(event) => setDraft({ ...draft, learningObjective: event.target.value })} />
          </label>
          <label>Source notes <small>Optional</small>
            <textarea value={draft.sourceText} maxLength={limits.sourceText} rows={5}
              placeholder="Paste facts, references or examples you want to include."
              onChange={(event) => setDraft({ ...draft, sourceText: event.target.value })} />
            <small>{draft.sourceText.length.toLocaleString('en')} / {limits.sourceText.toLocaleString('en')} characters</small>
          </label>
          <details className="brief-duration">
            <summary>Video length</summary>
            <label>Target duration
              <select value={draft.targetSeconds ?? ''} onChange={(event) => setDraft({
                ...draft, targetSeconds: event.target.value ? Number(event.target.value) : null,
              })}>
                <option value="">Automatic · 60–90 seconds</option>
                {Array.from({ length: 7 }, (_, index) => 60 + index * 5).map((seconds) => (
                  <option key={seconds} value={seconds}>{seconds} seconds</option>
                ))}
              </select>
            </label>
          </details>
        </div>
        <div className="brief-save-row">
          <p role="status">{saving ? 'Saving…' : conflict ? 'Save paused' : error ? 'Changes pending'
            : dirty ? 'Waiting to save…' : base.revision > 1 ? 'Saved' : 'Changes save automatically'}</p>
          <button className="primary-button" disabled={!pending || saving || !!conflict} onClick={() => void save()}>
            {error ? 'Retry save' : 'Save now'}
          </button>
        </div>
        {error && <p className="brief-error" role="alert">{error}</p>}
        {conflict && <div className="brief-conflict">
          <p role="alert">Another tab saved this plan. Choose which version to keep.</p>
          <div className="project-actions">
            <button className="text-link" onClick={() => {
              setDraft(conflict.current); setBase(conflict.current); setConflict(null);
            }}>Load saved plan</button>
            <button className="primary-button" onClick={() => {
              setDraft({ ...conflict.current, ...changedFields(draft, base), ...changedFields(draft, conflict.submitted) });
              setBase(conflict.current); setConflict(null);
            }}>Keep my edits</button>
          </div>
        </div>}
      </div>
      <aside className="brief-summary" aria-labelledby="plan-overview">
        <h2 id="plan-overview">Plan overview</h2>
        <p>{hasTopic && hasObjective ? 'Your brief has a topic and a learning objective.'
          : 'Add a topic and one clear learning objective to complete the brief.'}</p>
        <dl>
          <dt>Topic</dt><dd>{draft.topic.trim() || 'Add a topic'}</dd>
          <dt>Audience</dt><dd>{draft.audience.trim() || 'General audience'}</dd>
          <dt>Learning objective</dt><dd>{draft.learningObjective.trim() || 'Add a learning objective'}</dd>
          <dt>Duration</dt><dd>{draft.targetSeconds ? draft.targetSeconds + ' seconds' : 'Automatic · 60–90 seconds'}</dd>
        </dl>
      </aside>
    </div>
  );
}
