import type { ReactNode } from 'react';
import { Brand, ThemeToggle } from '../homepage-controls';
import { SignOut } from './sign-out';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#projects-content">Skip to content</a>
      <header className="site-header">
        <div className="shell nav-row">
          <Brand />
          <nav aria-label="Dashboard navigation"><a href="/dashboard">Projects</a><ThemeToggle /><SignOut /></nav>
        </div>
      </header>
      <main id="projects-content" className="shell projects-shell">{children}</main>
    </>
  );
}
