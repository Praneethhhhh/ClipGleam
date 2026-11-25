import { Brand, ThemeToggle } from '../homepage-controls';
import { AcceptInvite } from './accept-invite';

export const metadata = {
  title: 'Accept invitation | ClipGleam',
  referrer: 'no-referrer' as const,
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
  return (
    <>
      <header className="site-header"><div className="shell nav-row"><Brand /><ThemeToggle /></div></header>
      <main className="shell access-panel"><h1>Accept invitation</h1><AcceptInvite /></main>
    </>
  );
}
