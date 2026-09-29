/** Session lifetime rules; dependency-free so they can be unit-tested. */

/** Parses both ISO and SQLite CURRENT_TIMESTAMP ("YYYY-MM-DD HH:MM:SS", UTC) text. */
export function utcTimestamp(value: string) {
  const text = String(value ?? "");
  return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(text) ? text : `${text.replace(" ", "T")}Z`);
}

/**
 * Sessions end after inactivity: SESSION_IDLE_HOURS (default 8) for ordinary
 * logins and SESSION_REMEMBER_IDLE_DAYS (default 7) for "remember me" sessions,
 * which are recognised by a lifetime longer than a working day. The absolute
 * expiry (12 h / 30 d) set at login still applies.
 */
export function sessionIdleExpired(session: { last_seen_at: string; created_at: string; expires_at: string }, now = Date.now()) {
  const lastSeen = utcTimestamp(session.last_seen_at);
  if (!Number.isFinite(lastSeen)) return false;
  const remembered = utcTimestamp(session.expires_at) - utcTimestamp(session.created_at) > 24 * 60 * 60_000;
  const idleHours = remembered
    ? Math.max(1, Number(process.env.SESSION_REMEMBER_IDLE_DAYS ?? 7)) * 24
    : Math.max(0.25, Number(process.env.SESSION_IDLE_HOURS ?? 8));
  return now - lastSeen > idleHours * 60 * 60_000;
}
