import { z } from 'zod';
import type { ClientSession } from 'mongodb';
import { getPilotAuth } from './auth';

export const briefLimits = { topic: 180, audience: 180, learningObjective: 500, sourceText: 12000 } as const;

export const briefPatch = z.strictObject({
  expectedRevision: z.number().int().positive(),
  topic: z.string().max(briefLimits.topic).optional(),
  audience: z.string().max(briefLimits.audience).optional(),
  learningObjective: z.string().max(briefLimits.learningObjective).optional(),
  sourceText: z.string().max(briefLimits.sourceText).optional(),
  targetSeconds: z.number().int().min(60).max(90).nullable().optional(),
}).refine(({ expectedRevision: _, ...fields }) => Object.keys(fields).length > 0);

export type BriefFields = {
  topic: string;
  audience: string;
  learningObjective: string;
  sourceText: string;
  targetSeconds: number | null;
};

type StoredBrief = Omit<BriefFields, 'targetSeconds'> & {
  _id: string;
  projectId: string;
  ownerId: string;
  revision: number;
  updatedAt: Date;
  targetSeconds?: number | null;
};

export type Brief = BriefFields & { revision: number; updatedAt: string };

function view(brief: StoredBrief): Brief {
  return {
    topic: brief.topic, audience: brief.audience, learningObjective: brief.learningObjective,
    sourceText: brief.sourceText, targetSeconds: brief.targetSeconds ?? null,
    revision: brief.revision, updatedAt: brief.updatedAt.toISOString(),
  };
}

async function locate(ownerId: string, projectId: string, session?: ClientSession) {
  const { db } = getPilotAuth();
  const projects = db.collection<{ _id: string; ownerId: string; state: string; briefId: string; updatedAt: Date }>('projects');
  const parent = { _id: projectId, ownerId, state: 'active' };
  const project = await projects.findOne(parent, { projection: { briefId: 1 }, session });
  if (!project) return null;
  return {
    projects, parent, briefs: db.collection<StoredBrief>('briefs'),
    query: { _id: project.briefId, ownerId, projectId },
  };
}

export async function getBrief(ownerId: string, projectId: string) {
  const located = await locate(ownerId, projectId);
  const brief = located && await located.briefs.findOne(located.query);
  return brief ? view(brief) : null;
}

export async function saveBrief(ownerId: string, projectId: string, input: z.infer<typeof briefPatch>) {
  const { client } = getPilotAuth();
  const { expectedRevision, ...changes } = input;
  return client.withSession((session) => session.withTransaction(async () => {
    const located = await locate(ownerId, projectId, session);
    if (!located) return { status: 404 as const };
    const { briefs, query, projects, parent } = located;
    const updatedAt = new Date();
    const saved = await briefs.findOneAndUpdate({ ...query, revision: expectedRevision }, {
      $set: { ...changes, updatedAt }, $inc: { revision: 1 },
    }, { returnDocument: 'after', session });
    if (saved) {
      await projects.updateOne(parent, { $max: { updatedAt } }, { session });
      return { status: 200 as const, brief: view(saved) };
    }
    const current = await briefs.findOne(query, { session });
    return current ? { status: 409 as const, brief: view(current) } : { status: 404 as const };
  }));
}
