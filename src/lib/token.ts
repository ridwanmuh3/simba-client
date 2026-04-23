// Access token TTL on the server is 30 minutes. Cap reads of the non-HttpOnly
// token_exp cookie at 1 hour so a tampered value cannot delay the proactive
// refresh indefinitely. Impact of tampering is limited to UX (a late refresh
// triggers a 401 handled by the axios retry layer) but the cap keeps the
// proactive timer predictably close to the real expiry.
const MAX_TOKEN_LIFETIME_MS = 60 * 60 * 1000; // 1 hour

/** Reads the Unix timestamp (seconds) from the non-HttpOnly `token_exp` cookie. */
function getTokenExpUnix(): number | null {
  const match = document.cookie.match(/(?:^|;\s*)token_exp=([^;]+)/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  return isNaN(value) ? null : value;
}

/**
 * Returns milliseconds until the access JWT expires, capped at MAX_TOKEN_LIFETIME_MS.
 * Returns null when the cookie is absent (user not logged in / session cleared).
 */
export function msUntilTokenExpiry(): number | null {
  const expUnix = getTokenExpUnix();
  if (expUnix === null) return null;
  const remaining = expUnix * 1000 - Date.now();
  return Math.min(remaining, MAX_TOKEN_LIFETIME_MS);
}
