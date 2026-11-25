'use client';

import { useEffect, useId, useRef, useState } from 'react';

export function Brand() {
  return (
    <a className="brand" href="/" aria-label="ClipGleam home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="currentColor" d="M11.8 7.1C15.9 4.9 22 5.4 26 9.1c4.5 4.2 4.1 10.4.2 14.2-3.8 3.7-10.5 4.9-16.1 2.5C4.6 23.5 2.2 19 3.6 14.4c.5-1.5 1.2-2.8 2.3-3.9l5.5.7c.7.1 1.1-.5.9-1.1L11.8 7.1Z" />
      </svg>
      ClipGleam
    </a>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const preference = localStorage.getItem('clipgleam-theme') === 'dark';
      document.documentElement.dataset.theme = preference ? 'dark' : 'light';
      setDark(preference);
    } catch {
      // The default light theme remains usable if storage is unavailable.
    }
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    setDark(next);
    try {
      localStorage.setItem('clipgleam-theme', next ? 'dark' : 'light');
    } catch {
      // The current selection still applies to this page.
    }
  }

  return (
    <button type="button" className="icon-button" aria-label="Dark mode" aria-pressed={dark} onClick={toggle}>
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.5 15.4A8.6 8.6 0 0 1 8.6 3.5a8.7 8.7 0 1 0 11.9 11.9Z" />
      </svg>
    </button>
  );
}

type SamplePlayerProps = {
  title: string;
  source: string;
  poster: string;
  buttonLabel: string;
  primary?: boolean;
};

export function SamplePlayer({ title, source, poster, buttonLabel, primary = false }: SamplePlayerProps) {
  const labelId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(false);

  function show() {
    setFailed(false);
    setLoading(true);
    dialog.current?.showModal();
    setOpen(true);
  }

  function close() {
    setOpen(false);
    opener.current?.focus();
  }

  return (
    <>
      <button ref={opener} type="button" className={primary ? 'primary-button' : 'text-link'}
        aria-haspopup="dialog" onClick={show}>
        {buttonLabel} <span aria-hidden="true">{primary ? '▸' : '→'}</span>
      </button>
      <dialog className="sample-dialog" ref={dialog} aria-labelledby={labelId} onClose={close}>
        <div className="dialog-heading">
          <strong id={labelId}>{title}</strong>
          <button type="button" className="icon-button close-button" aria-label="Close sample" ref={closeButton}
            onClick={() => dialog.current?.close()}>×</button>
        </div>
        {open && (failed ? (
          <div className="player-error">
            <p role="status">The sample couldn’t load.</p>
            <button type="button" className="primary-button" onClick={() => {
              closeButton.current?.focus();
              setFailed(false);
              setLoading(true);
              setAttempt(previous => previous + 1);
            }}>
              Retry
            </button>
          </div>
        ) : (
          <>
          {loading && <p className="sample-status" role="status">Loading sample…</p>}
          <video key={attempt} controls playsInline preload="metadata" poster={poster}
            aria-label={`${title}, with captions in the video`} src={source}
            onLoadedMetadata={() => setLoading(false)}
            onError={() => { setLoading(false); setFailed(true); }} />
          </>
        ))}
      </dialog>
    </>
  );
}
