import { z } from 'zod';
import { getPilotAuth } from '../../../../lib/auth';
import {
  getOwnerAdmin, inviteEmail, inviteRedemption, issueInvitation, listInvitations, redeemInvitation, revokeInvitation,
} from '../../../../lib/invitations';

const headers = { 'Cache-Control': 'private, no-store' };
function json(status: number, data: object) {
  return Response.json(data, { status, headers });
}

async function body(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let content = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return JSON.parse(content + decoder.decode());
      size += chunk.value.byteLength;
      if (size > 4096) {
        void reader.cancel().catch(() => {});
        return null;
      }
      content += decoder.decode(chunk.value, { stream: true });
    }
  } catch { return null; }
}

type Context = { params: Promise<{ action?: string[] }> };

async function handle(request: Request, context: Context) {
  try {
    const path = (await context.params).action ?? [];
    const endpoint = path.join('/');
    if (request.method !== 'GET' && request.headers.get('origin') !== getPilotAuth().origin) {
      return json(403, { message: 'This request origin is unavailable.' });
    }
    if (endpoint === 'redeem' && request.method === 'POST') {
      const input = inviteRedemption.safeParse(await body(request));
      if (!input.success) return json(400, { message: 'Check your invite link, display name, and password.' });
      const result = await redeemInvitation(input.data);
      return result ? json(201, result) : json(409, { message: 'This invitation cannot be redeemed. Ask the owner to check it.' });
    }
    const owner = await getOwnerAdmin(request.headers);
    if (!owner) return json(403, { message: 'Owner access is required.' });
    if (!endpoint && request.method === 'GET') return json(200, { invitations: await listInvitations() });
    if (!endpoint && request.method === 'POST') {
      const input = inviteEmail.safeParse(await body(request));
      if (!input.success) return json(400, { message: 'Enter a valid email address.' });
      const result = await issueInvitation(owner.id, input.data.email);
      return result ? json(201, result) : json(409, { message: 'An account or active invitation already exists for this email.' });
    }
    if (request.method === 'DELETE' && z.uuid().safeParse(endpoint).success) {
      return await revokeInvitation(endpoint) ? new Response(null, { status: 204, headers })
        : json(409, { message: 'This invitation is no longer pending.' });
    }
    return json(404, { message: 'Invitation endpoint unavailable.' });
  } catch {
    return json(503, { message: 'Invitations are temporarily unavailable. Please try again.' });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
