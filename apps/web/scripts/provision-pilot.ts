import { z } from 'zod';
import { createProvisioningAuth } from '../lib/auth.ts';

const input = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(12).max(128),
}).safeParse({
  email: process.argv[2],
  name: process.argv[3],
  password: process.env.CLIPGLEAM_PILOT_PASSWORD,
});

if (!input.success) {
  console.error('Provide an email, display name, and a 12–128 character CLIPGLEAM_PILOT_PASSWORD.');
  process.exitCode = 1;
} else {
  let pilot: ReturnType<typeof createProvisioningAuth> | undefined;
  try {
    pilot = createProvisioningAuth();
    const context = await pilot.auth.$context;
    const existing = await context.internalAdapter.findUserByEmail(input.data.email, { includeAccounts: true });
    let userId: string;
    if (existing) {
      const credentials = existing.accounts.find((account) => account.providerId === 'credential');
      if (!credentials?.password || !await context.password.verify({
        hash: credentials.password, password: input.data.password,
      })) throw new Error('Existing credentials could not be verified.');
      userId = existing.user.id;
    } else {
      const account = await pilot.auth.api.signUpEmail({ body: input.data });
      const persisted = await context.internalAdapter.findUserByEmail(input.data.email);
      if (persisted?.user.id !== account.user.id) throw new Error('Account identity could not be verified.');
      userId = account.user.id;
    }
    const result = await pilot.admissions.updateOne({ _id: userId }, {
      $setOnInsert: { enabled: true },
    }, { upsert: true });
    if (!result.upsertedCount) throw new Error('An admission decision already exists.');
    console.log('Pilot account provisioned.');
  } catch {
    console.error('Provisioning failed. Verify configuration, database connectivity, and whether the account already exists.');
    process.exitCode = 1;
  } finally {
    await pilot?.client.close();
  }
}
