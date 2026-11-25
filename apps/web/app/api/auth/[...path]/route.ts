import { getPilotAuth } from '../../../../lib/auth';

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const endpoint = path.join('/');
  if (endpoint !== 'sign-in/email' && endpoint !== 'sign-out') {
    return new Response(null, { status: 404 });
  }
  try {
    const { auth, origin } = getPilotAuth();
    if (request.headers.get('origin') !== origin) {
      return new Response(null, { status: 403 });
    }
    const response = await auth.handler(request);
    if (endpoint === 'sign-in/email' && [400, 401, 403, 422].includes(response.status)) {
      return Response.json({ message: 'Unable to sign in with those credentials.' }, { status: 401 });
    }
    if (endpoint === 'sign-in/email' && response.ok) {
      const headers = new Headers({ 'Cache-Control': 'no-store' });
      for (const cookie of response.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
      return new Response(null, { status: 204, headers });
    }
    return response;
  } catch {
    return Response.json({ message: 'Sign-in service is temporarily unavailable.' }, { status: 503 });
  }
}
