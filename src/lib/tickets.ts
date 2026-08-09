import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.TICKET_SECRET || process.env.AUTH_SECRET || 'dev-ticket-secret';

function sign(code: string): string {
  return createHmac('sha256', SECRET).update(code).digest('base64url').slice(0, 20);
}

/** The value encoded in the QR: `CODE.SIGNATURE` — tamper-proof. */
export function ticketToken(code: string): string {
  return `${code}.${sign(code)}`;
}

/**
 * Extract the ticket code from a scanned value.
 * - A signed token (`CODE.SIG`) is HMAC-verified; a bad signature returns null.
 * - A raw code (no dot, e.g. staff manual entry) passes through unverified,
 *   since manual entry is an authenticated admin action.
 */
export function readTicketCode(scanned: string): string | null {
  const value = scanned.trim();
  const dot = value.lastIndexOf('.');
  if (dot < 0) return value.toUpperCase() || null; // raw code (manual)

  const code = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = sign(code);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null; // forged / tampered
  return code.toUpperCase();
}
