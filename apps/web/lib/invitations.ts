import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { MongoServerError, ObjectId } from 'mongodb';
import { z } from 'zod';
import { getPilotAuth, getPilotUser } from './auth';

export const inviteEmail = z.strictObject({ email: z.email().max(254).transform((email) => email.toLowerCase()) });
export const inviteRedemption = z.strictObject({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(12).max(128),
});

type Invitation = {
  _id: string; id: string; digest: string; state: 'pending' | 'revoked' | 'redeemed';
  createdAt: Date; expiresAt: Date; issuedBy: string;
  revokedAt?: Date; redeemedAt?: Date; attempts: number;
};

function invitationCollection() {
  return getPilotAuth().db.collection<Invitation>('pilotInvitations');
}

export function isOwnerAdmin(userId: string) {
  return !!process.env.CLIPGLEAM_ADMIN_USER_ID && userId === process.env.CLIPGLEAM_ADMIN_USER_ID;
}

export async function getOwnerAdmin(headers: Headers) {
  const user = headers.get('cookie') ? await getPilotUser(headers) : null;
  return user && isOwnerAdmin(user.id) ? user : null;
}

export async function listInvitations() {
  const now = new Date();
  const rows = await invitationCollection().find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return rows.map((row) => ({
    id: row.id, email: row._id, createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt.toISOString(),
    status: row.state === 'pending' && row.expiresAt <= now ? 'expired' : row.state,
  }));
}

export async function issueInvitation(issuedBy: string, email: string) {
  const { auth, origin } = getPilotAuth();
  const context = await auth.$context;
  if (await context.internalAdapter.findUserByEmail(email)) return null;
  const token = randomBytes(32).toString('base64url');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 72);
  const invite = { id: randomUUID(), digest: digestToken(token), state: 'pending' as const, createdAt, expiresAt, issuedBy, attempts: 0 };
  try {
    await invitationCollection().updateOne({
      _id: email,
      $or: [{ state: 'revoked' }, { state: 'pending', expiresAt: { $lte: createdAt } }],
    }, { $set: invite, $unset: { revokedAt: "", redeemedAt: "" } }, { upsert: true });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return null;
    throw error;
  }
  return { id: invite.id, url: origin + '/accept-invite#' + token, expiresAt: expiresAt.toISOString() };
}

export async function revokeInvitation(id: string) {
  const now = new Date();
  const result = await invitationCollection().updateOne({ id, state: 'pending', expiresAt: { $gt: now } }, {
    $set: { state: 'revoked', revokedAt: now },
  });
  return result.modifiedCount === 1;
}

function digestToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

let redemptionIndexes: Promise<unknown> | undefined;

export async function redeemInvitation(input: z.infer<typeof inviteRedemption>) {
  const { client, admissions, auth, db } = getPilotAuth();
  const collection = invitationCollection();
  const users = db.collection('user');
  const accounts = db.collection('account');
  redemptionIndexes ??= Promise.all([
    collection.createIndex({ digest: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { name: 'user_email_uidx', unique: true }),
  ]).catch((error) => {
    redemptionIndexes = undefined;
    throw error;
  });
  await redemptionIndexes;

  const digest = digestToken(input.token);
  const invitation = await collection.findOneAndUpdate({
    digest, state: 'pending', expiresAt: { $gt: new Date() }, attempts: { $lt: 10 },
  }, { $inc: { attempts: 1 } }, { returnDocument: 'after' });
  if (!invitation) return null;

  const { password } = await auth.$context;
  const hash = await password.hash(input.password);
  const userId = new ObjectId();

  try {
    return await client.withSession((session) => session.withTransaction(async () => {
      const now = new Date();
      const redeemed = await collection.updateOne({
        _id: invitation._id, id: invitation.id, digest, state: 'pending', expiresAt: { $gt: now },
      }, { $set: { state: 'redeemed', redeemedAt: now } }, { session });
      if (redeemed.modifiedCount !== 1) return null;

      // These are the user and credential record shapes used by the pinned Better Auth MongoDB adapter.
      await users.insertOne({
        _id: userId, email: invitation._id, name: input.name, emailVerified: false,
        createdAt: now, updatedAt: now,
      }, { session });
      await accounts.insertOne({
        accountId: userId.toHexString(), userId, providerId: 'credential', password: hash,
        createdAt: now, updatedAt: now,
      }, { session });
      await admissions.insertOne({ _id: userId.toHexString(), enabled: true }, { session });
      return { email: invitation._id };
    }));
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return null;
    throw error;
  }
}
