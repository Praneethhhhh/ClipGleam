export default function UnavailableProject() {
  return (
    <div className="project-empty">
      <h1>Project unavailable</h1>
      <p>This project may have been deleted, or you may not have access.</p>
      <a className="text-link" href="/dashboard">All projects</a>
    </div>
  );
}
