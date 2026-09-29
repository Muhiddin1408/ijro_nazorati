/**
 * Research workflow service: one handler per action. The HTTP route only
 * authenticates, parses and dispatches; web and future channels share these.
 */
import { ApiError } from "../../lib/errors";
import { authorize } from "../../lib/policy";
import { researchDomainView } from "../../lib/policy/research";
import type { ResearchActionContext } from "./common";
import { reviewStage, submitStage } from "./stage-actions";
import { createProblem, createForeign, createTopic, submitProposal } from "./intake-actions";
import { activateProject, archiveProject, createProjectAction, startImplementation, updateProject } from "./projects-actions";

type ResearchHandler = (ctx: ResearchActionContext) => Promise<Response>;

const HANDLERS: Record<string, ResearchHandler> = {
  create_project: createProjectAction,
  update_project: updateProject,
  activate_project: activateProject,
  start_implementation: startImplementation,
  archive_project: archiveProject,
  submit_stage: submitStage,
  verify_stage: reviewStage,
  review_stage: reviewStage,
  create_problem: createProblem,
  submit_proposal: submitProposal,
  create_topic: createTopic,
  create_foreign: createForeign,
};

const RETIRED_ACTIONS = new Set(["select_proposal", "select_topic", "pilot_foreign"]);

export async function handleResearchAction(ctx: ResearchActionContext): Promise<Response> {
  await authorize(researchDomainView(ctx.context));
  if (RETIRED_ACTIONS.has(ctx.action)) {
    throw new ApiError(
      410,
      "Tezkor konvertatsiya o‘chirildi. Ma’lumotlar markazidagi to‘liq loyiha pasporti orqali davom eting.",
    );
  }
  // `payload.role` is intentionally ignored. Every decision is derived from the
  // authenticated employee, canonical directory records and policy.
  const handler = HANDLERS[ctx.action];
  if (!handler) throw new ApiError(404, "Noma’lum amal.");
  return handler(ctx);
}

export { assertReportsResearchRoute, requestPayload } from "./common";
