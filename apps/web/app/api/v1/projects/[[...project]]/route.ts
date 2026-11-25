import { z, type ZodType } from 'zod';
import { getPilotAuth, getPilotUser } from '../../../../../lib/auth';
import {
  createProject, decodeProjectCursor, deleteProject, getProject, listProjects,
  newProject, projectId, renameProject, updateProject,
} from '../../../../../lib/projects';

type Context = { params: Promise<{ project?: string[] }> };
const headers = { 'Cache-Control': 'private, no-store' };

function json(status: number, data: object, extra: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { ...headers, ...extra } });
}

function failure(status: number, message: string) {
  return json(status, { error: { message } });
}

async function body<T>(schema: ZodType<T>, request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return null;
  try {
    const parsed = schema.safeParse(await request.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function handle(request: Request, context: Context) {
  try {
    const path = (await context.params).project ?? [];
    if (path.length > 1 || (path.length && !projectId.safeParse(path[0]).success)) {
      return failure(404, 'Project unavailable.');
    }
    if (!request.headers.get('cookie')) return failure(401, 'Sign in to continue.');
    if (request.method !== 'GET' && request.headers.get('origin') !== getPilotAuth().origin) {
      return failure(403, 'This request origin is unavailable.');
    }
    const user = await getPilotUser(request.headers);
    if (!user) return failure(401, 'Sign in to continue.');
    const id = path[0];

    if (request.method === 'GET') {
      if (id) {
        const project = await getProject(user.id, id);
        return project ? json(200, { data: project }) : failure(404, 'Project unavailable.');
      }
      const cursor = decodeProjectCursor(new URL(request.url).searchParams.get('cursor'));
      if (cursor === undefined) return failure(400, 'Invalid project page.');
      const page = await listProjects(user.id, cursor);
      return json(200, { data: page.projects, meta: { nextCursor: page.nextCursor } });
    }
    if (request.method === 'POST' && !id) {
      const input = await body(newProject, request);
      const key = z.uuid().safeParse(request.headers.get('idempotency-key'));
      if (!input || !key.success) return failure(400, 'Enter a title and select a language.');
      const result = await createProject(user.id, key.data, input);
      return result.project ? json(result.status, { data: result.project },
        result.replayed ? { 'Idempotency-Replayed': 'true' } : {})
        : failure(409, 'This creation request conflicts with an earlier one.');
    }
    if (request.method === 'PATCH' && id) {
      const input = await body(renameProject, request);
      if (!input) return failure(400, 'Enter a valid project title.');
      const result = await updateProject(user.id, id, input);
      if (result.project) return json(200, { data: result.project });
      return result.status === 409 ? failure(409, 'This project changed. Reload it before renaming.')
        : failure(404, 'Project unavailable.');
    }
    if (request.method === 'DELETE' && id) {
      const match = /^"([1-9][0-9]{0,14})"$/.exec(request.headers.get('if-match') ?? '');
      if (!match) return failure(428, 'Reload the project before deleting it.');
      const status = await deleteProject(user.id, id, Number(match[1]));
      if (status === 204) return new Response(null, { status, headers });
      return status === 409 ? failure(409, 'This project changed. Reload it before deleting.')
        : failure(404, 'Project unavailable.');
    }
    return failure(405, 'This action is unavailable.');
  } catch {
    return failure(503, 'Projects are temporarily unavailable. Please try again.');
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
