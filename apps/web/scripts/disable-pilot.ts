import { z } from 'zod';
import { getPilotAuth } from '../lib/auth.ts';

const email = z.email().transform((value) => value.toLowerCase()).safeParse(process.argv[2]);
if (!email.success) {
  console.error('Provide the pilot account email.');
  process.exitCode = 1;
} else {
  let pilot: ReturnType<typeof getPilotAuth> | undefined;
  try {
    pilot = getPilotAuth();
    const context = await pilot.auth.$context;
    const existing = await context.internalAdapter.findUserByEmail(email.data);
    if (!existing) throw new Error('Pilot account not found.');
    const admission = await pilot.admissions.updateOne({ _id: existing.user.id }, {
      $set: { enabled: false },
    });
    if (!admission.matchedCount) throw new Error('Pilot admission not found.');
    await context.internalAdapter.deleteUserSessions(existing.user.id);
    console.log('Pilot access disabled and sessions revoked.');
  } catch {
    console.error('Could not confirm that access was disabled and all sessions revoked. Check the account and retry.');
    process.exitCode = 1;
  } finally {
    await pilot?.client.close();
  }
}
