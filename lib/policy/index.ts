/**
 * Authorization core. Every "may this actor do X to Y" decision lives in a
 * module policy (lib/policy/<module>.ts) as a pure-ish function returning a
 * Decision; routes and Telegram handlers call `authorize(decision)` instead of
 * re-implementing checks inline.
 *
 * Conventions:
 * - Policy functions are named `<resource><Action>` (e.g. `taskAccept`) and take
 *   `(actor, resource, context?)`; they do not write to the database.
 * - Use 404 (not 403) when the actor must not learn that the resource exists.
 * - Messages are user-facing Uzbek (Latin).
 */
import { ApiError } from "../errors";

export type DenyStatus = 400 | 401 | 403 | 404 | 409 | 428 | 429;

export type Decision =
  | { allowed: true }
  | { allowed: false; status: DenyStatus; message: string };

export const ALLOW: Decision = { allowed: true };

export function deny(message: string, status: DenyStatus = 403): Decision {
  return { allowed: false, status, message };
}

/** First denial wins; all checks allowed → allowed. */
export function all(...decisions: Decision[]): Decision {
  return decisions.find((decision) => !decision.allowed) ?? ALLOW;
}

/** Any allowed check wins; otherwise the first denial is reported. */
export function any(...decisions: Decision[]): Decision {
  return decisions.find((decision) => decision.allowed) ?? decisions[0] ?? deny("Bu amal uchun vakolatingiz yetarli emas");
}

export function when(condition: boolean, message: string, status: DenyStatus = 403): Decision {
  return condition ? ALLOW : deny(message, status);
}

/** Throws the ApiError the route's `apiError()` turns into a JSON response. */
export async function authorize(decision: Decision | Promise<Decision>): Promise<void> {
  const resolved = await decision;
  if (!resolved.allowed) throw new ApiError(resolved.status, resolved.message);
}
