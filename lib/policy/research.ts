import type { Actor } from "../auth";
import {
  canContributeResearchProject,
  canCreateResearchProject,
  canReviewResearchProject,
  canUploadResearchFile,
  canVerifyResearchProject,
  canViewResearchProject,
  isReadOnlyCommitteeLeadership,
  type ResearchPolicyContext,
  type ResearchProjectPolicyRow,
} from "../research-policy";
import { isEditableRecordStatus } from "../shared/statuses";
import { all, when, type Decision } from "./index";

const DEFAULT_MESSAGE = "Bu amal uchun vakolatingiz yetarli emas.";

type MilestoneActors = {
  submitted_by_employee_id: number | null;
  verified_by_employee_id: number | null;
};

export function researchDomainView(context: ResearchPolicyContext): Decision {
  return when(context.domainVisible !== false, "Ilmiy tadqiqotlarni ko‘rish huquqi biriktirilmagan.");
}

export function researchProjectCreate(actor: Actor, context: ResearchPolicyContext, message = DEFAULT_MESSAGE): Decision {
  return when(canCreateResearchProject(actor, context), message);
}

export function researchProjectReview(actor: Actor, context: ResearchPolicyContext, message = DEFAULT_MESSAGE): Decision {
  return when(canReviewResearchProject(actor, context), message);
}

export function researchProjectView(actor: Actor, project: ResearchProjectPolicyRow, context: ResearchPolicyContext): Decision {
  return when(canViewResearchProject(actor, project, context), "Loyiha topilmadi.", 404);
}

export function researchFileUpload(actor: Actor, project: ResearchProjectPolicyRow, context: ResearchPolicyContext): Decision {
  return when(canUploadResearchFile(actor, project, context), "Bu bosqichda fayl yuklash uchun vakolatingiz yetarli emas.");
}

export function researchStageSubmit(actor: Actor, project: ResearchProjectPolicyRow, context: ResearchPolicyContext): Decision {
  return when(
    canContributeResearchProject(actor, project, context),
    "Bosqich natijasini faqat biriktirilgan mas’ul ijrochi yuborishi mumkin.",
  );
}

/** Institute-level verification: never by the person who submitted the stage. */
export function researchStageVerify(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  milestone: MilestoneActors,
  context: ResearchPolicyContext,
): Decision {
  return all(
    when(canVerifyResearchProject(actor, project, context), "Ijrochi tashkilot tekshiruvi uchun vakolatingiz yetarli emas."),
    when(Number(milestone.submitted_by_employee_id) !== actor.id, "Natijani yuborgan xodim o‘z ishini tekshira olmaydi."),
  );
}

/** Committee review: separated from the creator, submitter and institute verifier. */
export function researchStageFinalReview(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  milestone: MilestoneActors,
  context: ResearchPolicyContext,
): Decision {
  const involved = [
    Number(project.createdByEmployeeId),
    Number(milestone.submitted_by_employee_id),
    Number(milestone.verified_by_employee_id),
  ];
  return all(
    when(canReviewResearchProject(actor, context), "Qo‘mita tekshiruvi uchun vakolatingiz yetarli emas."),
    when(
      !involved.includes(actor.id),
      "Loyihani yaratgan, yuborgan yoki tashkilotda tekshirgan xodim yakuniy tasdiqlovchi bo‘la olmaydi.",
    ),
  );
}

export function researchProposalSubmit(actor: Actor, context: ResearchPolicyContext): Decision {
  return when(
    Boolean(actor.organizationId)
      && !isReadOnlyCommitteeLeadership(actor)
      && context.domainEditable
      && (actor.permissions.canEnterInformation || actor.permissions.canSubmitInformation),
    "Ilmiy yechim arizasini faqat vakolatli tashkilot xodimi yuborishi mumkin.",
  );
}

export type ResearchUploadKind = "owner" | "evidence" | null;

/**
 * Passport / technical-task files: project owners while the passport is editable.
 * Evidence / result files: the responsible executor, for the current stage only.
 */
export function researchUploadKind(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  context: ResearchPolicyContext,
  purpose: string,
  hasMilestone: boolean,
): ResearchUploadKind {
  if (canCreateResearchProject(actor, context) && isEditableRecordStatus(project.status)
    && ["passport", "technical_task"].includes(purpose) && !hasMilestone) return "owner";
  if (canContributeResearchProject(actor, project, context) && ["active", "returned"].includes(String(project.status))
    && ["evidence", "result"].includes(purpose) && hasMilestone) return "evidence";
  return null;
}

export function researchProjectFileUpload(kind: ResearchUploadKind): Decision {
  return when(kind !== null, "Bu turdagi faylni yuklash vakolatingiz yo‘q");
}

export function researchFileDownload(actor: Actor, project: ResearchProjectPolicyRow, context: ResearchPolicyContext): Decision {
  return when(canViewResearchProject(actor, project, context), "Fayl topilmadi", 404);
}
