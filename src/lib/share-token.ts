import crypto from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Generate a permanent HMAC-signed share token for a walkthrough. */
export function generateShareToken(walkthroughId: string, orgId: string): string {
  const payload = `${walkthroughId}:${orgId}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

/** Verify a share token. Returns { walkthroughId, orgId } or null if invalid. */
export function verifyShareToken(
  token: string,
): { walkthroughId: string; orgId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    const sig = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);

    // payload = "walkthroughId:orgId" (UUIDs have no colons so split is safe)
    const parts = payload.split(':');
    if (parts.length !== 2) return null;
    const [walkthroughId, orgId] = parts;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(sig, 'hex'),
        Buffer.from(expectedSig, 'hex'),
      )
    )
      return null;

    return { walkthroughId, orgId };
  } catch {
    return null;
  }
}
