import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Brand, ThemeToggle } from '../homepage-controls';
import { SignOut } from './sign-out';
import { getPilotUser } from '../../lib/auth';

export const metadata = { title: 'Dashboard | ClipGleam' };

export default async function Dashboard() {
  const requestHeaders = await headers();
  let user;
  try {
    user = requestHeaders.get('cookie') ? await getPilotUser(requestHeaders) : null;
  } catch {
    return <main className="shell access-panel">
      <h1>Dashboard unavailable</h1>
      <p>We could not verify your session. Please try again in a moment.</p>
      <a className="text-link" href="/dashboard">Try again</a>
    </main>;
  }
  if (!user) redirect('/sign-in');

  return (
    <>
      <header className="site-header"><div className="shell nav-row"><Brand /><ThemeToggle /></div></header>
      <main className="shell access-panel">
        <h1>Dashboard</h1>
        <p>Signed in as {user.email}.</p>
        <SignOut />
      </main>
    </>
  );
}
