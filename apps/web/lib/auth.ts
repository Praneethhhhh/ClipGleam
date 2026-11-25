import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { MongoClient } from 'mongodb';
import { z } from 'zod';

const configuration = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

function createPilotAuth(provisioning: boolean) {
  const config = configuration.parse(process.env);
  const client = new MongoClient(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = client.db(config.MONGODB_DATABASE);
  const admissions = db.collection<{ _id: string; enabled: boolean }>('pilotAdmissions');
  const auth = betterAuth({
    appName: 'ClipGleam',
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, provisioning ? { client } : undefined),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !provisioning,
      autoSignIn: false,
      minPasswordLength: 12,
    },
    session: { expiresIn: 60 * 60 * 24 * 7, disableSessionRefresh: true },
    rateLimit: { enabled: true, storage: 'database' },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => Boolean(await admissions.findOne({
            _id: session.userId,
            enabled: true,
          })),
        },
      },
    },
  });
  return { auth, admissions, client, db, origin: new URL(config.BETTER_AUTH_URL).origin };
}

let instance: ReturnType<typeof createPilotAuth> | undefined;
export function getPilotAuth() {
  return instance ??= createPilotAuth(false);
}

export function createProvisioningAuth() {
  return createPilotAuth(true);
}

export async function getPilotUser(headers: Headers) {
  const { auth, admissions } = getPilotAuth();
  const session = await auth.api.getSession({ headers });
  if (!session || !await admissions.findOne({ _id: session.user.id, enabled: true })) return null;
  return session.user;
}
