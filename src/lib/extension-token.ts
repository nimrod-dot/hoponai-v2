import crypto from 'crypto';

// Uses SUPABASE_SERVICE_ROLE_KEY as the signing secret (already required by the app).
// No extra env vars or DB tables needed.
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generateExtensionToken(userId: string, orgId: string): string {
  const expiry = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${orgId}:${expiry}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifyExtensionToken(
  token: string
): { userId: string; orgId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    const sig = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);

    const parts = payload.split(':');
    if (parts.length !== 3) return null;
    const [userId, orgId, expiryStr] = parts;

    if (Date.now() > parseInt(expiryStr)) return null;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex')))
      return null;

    return { userId, orgId };
  } catch {
    return null;
  }
}

/** Extracts a Bearer token from an Authorization header value. */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}
