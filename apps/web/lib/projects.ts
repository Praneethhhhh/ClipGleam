import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getPilotAuth } from './auth';

export const projectLanguages = {
  en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil',
} as const;
export const projectId = z.string().regex(/^[a-f0-9]{64}$/);
const title = z.string().trim().min(1).max(120);
export const newProject = z.strictObject({ title, language: z.enum(['en', 'hi', 'te', 'ta']) });
export const renameProject = z.strictObject({ title, revision: z.number().int().positive() });

type Project = {
  _id: string;
  ownerId: string;
  schemaVersion: 1;
  title: string;
  language: keyof typeof projectLanguages;
  revision: number;
  state: 'active' | 'deleting';
  createdAt: Date;
  updatedAt: Date;
  briefId: string;
  draftId: string;
  createFingerprint: string;
  createTitle?: string;
  deletedAt?: Date;
};

const pageSize = 24;
const cursorShape = z.tuple([z.iso.datetime(), projectId]);
export function decodeProjectCursor(raw: string | null) {
  if (raw === null) return null;
  if (raw.length > 180 || !/^[A-Za-z0-9_-]+$/.test(raw)) return undefined;
  try {
    const parsed = cursorShape.safeParse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

function summary(project: Project) {
  return {
    id: project._id, title: project.title, language: project.language, revision: project.revision,
    updatedAt: project.updatedAt.toISOString(),
  };
}

function collections() {
  const { client, db } = getPilotAuth();
  return {
    client, projects: db.collection<Project>('projects'),
    briefs: db.collection<{ _id: string; projectId: string; ownerId: string; [key: string]: unknown }>('briefs'),
    drafts: db.collection<{ _id: string; projectId: string; ownerId: string; [key: string]: unknown }>('drafts'),
  };
}

let projectIndex: Promise<string> | undefined;

export async function listProjects(ownerId: string, cursor: z.infer<typeof cursorShape> | null = null) {
  const { projects } = collections();
  projectIndex ??= projects.createIndex({ ownerId: 1, state: 1, updatedAt: -1, _id: -1 }).catch((error) => {
    projectIndex = undefined;
    throw error;
  });
  await projectIndex;
  const time = cursor ? new Date(cursor[0]) : null;
  const boundary = cursor && time ? {
    $or: [{ updatedAt: { $lt: time } }, { updatedAt: time, _id: { $lt: cursor[1] } }],
  } : {};
  const rows = await projects.find({ ownerId, state: 'active', ...boundary })
    .sort({ updatedAt: -1, _id: -1 }).limit(pageSize + 1).toArray();
  const last = rows[pageSize - 1];
  return {
    projects: rows.slice(0, pageSize).map(summary),
    nextCursor: rows.length > pageSize && last
      ? Buffer.from(JSON.stringify([last.updatedAt.toISOString(), last._id])).toString('base64url') : null,
  };
}

export async function getProject(ownerId: string, id: string) {
  const project = await collections().projects.findOne({ _id: id, ownerId, state: 'active' });
  return project ? summary(project) : null;
}

export async function createProject(ownerId: string, key: string, input: z.infer<typeof newProject>) {
  const { client, projects, briefs, drafts } = collections();
  const id = createHash('sha256').update(JSON.stringify([ownerId, key])).digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify([input.title, input.language])).digest('hex');
  const now = new Date();
  const briefId = randomUUID();
  const draftId = randomUUID();
  const original = {
    _id: id, ownerId, ...input, schemaVersion: 1, state: 'active', revision: 1,
    createdAt: now, updatedAt: now, briefId, draftId, createFingerprint: fingerprint, createTitle: input.title,
    messageSequence: 0, nextStoryboardVersion: 1, nextRenderVersion: 1,
  } as const;
  function replay(existing: Project) {
    if (existing.state !== 'active' || existing.createFingerprint !== fingerprint || !existing.createTitle) {
      return { status: 409 as const };
    }
    return {
      status: 201 as const, replayed: true,
      project: summary({ ...existing, title: existing.createTitle, revision: 1, updatedAt: existing.createdAt }),
    };
  }
  try {
    return await client.withSession((session) => session.withTransaction(async () => {
      const existing = await projects.findOne({ _id: id, ownerId }, { session });
      if (existing) return replay(existing);
      const base = { schemaVersion: 1, projectId: id, ownerId, revision: 1, createdAt: now, updatedAt: now };
      await projects.insertOne(original, { session });
      await briefs.insertOne({ ...base, _id: briefId, topic: '', audience: '', sourceText: '', learningObjective: '' }, { session });
      await drafts.insertOne({ ...base, _id: draftId, editableHash: null, validation: [] }, { session });
      return { status: 201 as const, replayed: false, project: summary(original) };
    }));
  } catch (error) {
    if (typeof error !== 'object' || !error || !('code' in error) || error.code !== 11000) throw error;
    const existing = await projects.findOne({ _id: id, ownerId });
    if (!existing) throw error;
    return replay(existing);
  }
}

export async function updateProject(ownerId: string, id: string, input: z.infer<typeof renameProject>) {
  const { projects } = collections();
  const active = { _id: id, ownerId, state: 'active' as const };
  const project = await projects.findOneAndUpdate({ ...active, revision: input.revision }, {
    $set: { title: input.title, updatedAt: new Date() }, $inc: { revision: 1 },
  }, { returnDocument: 'after' });
  if (project) return { status: 200 as const, project: summary(project) };
  return { status: await projects.findOne(active, { projection: { _id: 1 } }) ? 409 as const : 404 as const };
}

export async function deleteProject(ownerId: string, id: string, revision: number) {
  const { client, projects, briefs, drafts } = collections();
  return client.withSession((session) => session.withTransaction(async () => {
    const project = await projects.findOne({ _id: id, ownerId }, { session });
    if (!project) return 404;
    if (project.state === 'deleting') return 204;
    if (project.revision !== revision) return 409;
    const deletedAt = new Date();
    await projects.updateOne({ _id: id, ownerId, state: 'active' }, {
      $set: { state: 'deleting', title: '', deletedAt, updatedAt: deletedAt },
      $unset: { createTitle: '' }, $inc: { revision: 1 },
    }, { session });
    await briefs.deleteOne({ _id: project.briefId, projectId: id, ownerId }, { session });
    await drafts.deleteOne({ _id: project.draftId, projectId: id, ownerId }, { session });
    return 204;
  }));
}
