import { Brand, ThemeToggle } from '../homepage-controls';
import { SignInForm } from './sign-in-form';

export const metadata = { title: 'Sign in | ClipGleam' };

export default function SignIn() {
  return (
    <>
      <header className="site-header"><div className="shell nav-row"><Brand /><ThemeToggle /></div></header>
      <main className="shell access-panel">
        <h1>Sign in</h1>
        <p>Use the account provided for the ClipGleam pilot.</p>
        <SignInForm />
      </main>
    </>
  );
}
