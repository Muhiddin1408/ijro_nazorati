import type { Actor } from "../auth";
import {
  canDelegateReportStatus,
  canManageReportTemplateFile,
  canReviewReport,
  canSubmitOrDelegateReport,
} from "../mutation-authority";
import { all, when, type Decision } from "./index";
import { isEditableReportStatus } from "../shared/statuses";

/** The authorization-relevant facts about one report assignment. */
export type ReportAssignmentFacts = {
  status: string;
  responsibleEmployeeId: number;
  submittedByEmployeeId: number | null;
  templateCreatorEmployeeId: number;
  ownerDepartmentId: number | null;
  parentResponsibleEmployeeId: number | null;
  allowDelegation: boolean;
};

export function reportAssignmentView(canAccess: boolean): Decision {
  return when(canAccess, "Hisobot topilmadi", 404);
}

export function reportTemplateCreate(actor: Actor): Decision {
  return when(actor.permissions.canManageReports, "Bu amal uchun vakolatingiz yetarli emas");
}

export function reportRecipientOrganization(inScope: boolean): Decision {
  return when(inScope, "Tanlangan tashkilot vakolatingiz doirasiga kirmaydi");
}

export function reportFill(actor: Actor, report: ReportAssignmentFacts): Decision {
  return all(
    when(canSubmitOrDelegateReport(actor, report.responsibleEmployeeId), "Hisobotni faqat mas’ul xodim to‘ldiradi"),
    when(
      isEditableReportStatus(report.status),
      "Yuborilgan hisobot o‘zgartirilmaydi. Avval tahrirga qaytarilishi kerak",
      409,
    ),
  );
}

export function reportDelegate(actor: Actor, report: ReportAssignmentFacts): Decision {
  return all(
    when(report.allowDelegation, "Ushbu hisobotni quyi tashkilotga yuborishga ruxsat berilmagan", 409),
    when(canSubmitOrDelegateReport(actor, report.responsibleEmployeeId), "Hisobotni faqat biriktirilgan mas’ul xodim taqsimlay oladi"),
    when(canDelegateReportStatus(report.status), "Yuborilgan yoki tasdiqlangan hisobotni qayta taqsimlab bo‘lmaydi", 409),
  );
}

/** Y8: the responsible executor and the submitter can never approve or return their own report. */
export function reportReview(actor: Actor, report: ReportAssignmentFacts): Decision {
  return all(
    when(
      canReviewReport(actor, {
        templateCreatorEmployeeId: report.templateCreatorEmployeeId,
        ownerDepartmentId: report.ownerDepartmentId,
        parentResponsibleEmployeeId: report.parentResponsibleEmployeeId,
        responsibleEmployeeId: report.responsibleEmployeeId,
        submittedByEmployeeId: report.submittedByEmployeeId,
      }),
      "Hisobotni ko‘rib chiqish vakolatingiz yo‘q. O‘zingiz topshirgan hisobotni o‘zingiz tasdiqlay olmaysiz",
    ),
    when(report.status === "submitted", "Faqat yuborilgan hisobot ko‘rib chiqiladi", 409),
  );
}

export function reportTemplateFileManage(
  actor: Actor,
  template: { templateCreatorEmployeeId: number; ownerDepartmentId: number | null } | null,
): Decision {
  return when(
    Boolean(template) && canManageReportTemplateFile(actor, template!),
    "Namunaviy faylni faqat hisobotning aniq boshqaruvchisi yuklaydi",
  );
}

export function reportAssignmentFileAttach(actor: Actor, responsibleEmployeeId: number | null): Decision {
  return when(
    responsibleEmployeeId != null && canSubmitOrDelegateReport(actor, responsibleEmployeeId),
    "Faylni faqat mas’ul xodim biriktira oladi",
  );
}

/** UI capability flags derived from the same decisions the mutations enforce. */
export function reportCapabilities(actor: Actor, report: ReportAssignmentFacts) {
  const responsible = canSubmitOrDelegateReport(actor, report.responsibleEmployeeId);
  return {
    edit: responsible && isEditableReportStatus(report.status),
    delegate: responsible && canDelegateReportStatus(report.status) && report.allowDelegation,
    review: report.status === "submitted" && reportReview(actor, report).allowed,
  };
}
