import type { Actor } from "../auth";
import {
  canOpenInformationRecord,
  canViewSensitiveInformation,
  sensitiveFieldCodes,
  type InformationAccess,
} from "../information";
import { canActorApproveInformationStep, type InformationWorkflowConfig } from "../information-workflow";
import { canDeleteInformationFile, canUploadInformationFile } from "../mutation-authority";
import { isEditableRecordStatus } from "../shared/statuses";
import { all, when, type Decision } from "./index";

type Row = Record<string, unknown>;

/** Creating a record requires an editable domain and, for restricted forms, restricted access. */
export function informationRecordCreate(
  access: InformationAccess,
  template: { domainId: number; visibility: string },
): Decision {
  return all(
    when(access.editable.includes(template.domainId), "Bu boshqarma ma’lumotini kiritish vakolatingiz yo‘q"),
    when(
      template.visibility !== "restricted" || access.restricted.includes(template.domainId),
      "Bu yopiq ma’lumot shakliga kirish vakolatingiz yo‘q",
    ),
  );
}

/** Y10: a pending approval grants access to that record only, never to the whole domain. */
export function informationRecordOpen(
  access: InformationAccess,
  record: { recordId: number; domainId: number; templateVisibility: string },
): Decision {
  return when(canOpenInformationRecord(access, record), "Bu yozuv vakolat doirangizga kirmaydi");
}

/** Actions the workflow engine computed for this actor and record state. */
export function informationRecordAction(allowedActions: readonly string[], action: string): Decision {
  return when(allowedActions.includes(action), "Bu holatdagi yozuv uchun ushbu amal vakolatingizga kirmaydi");
}

/** Y8: the record creator never approves their own step, administrators included. */
export async function informationStepDecide(
  db: D1Database,
  actor: Actor,
  record: { domainId: number; creatorEmployeeId: number },
  step: Row,
): Promise<Decision> {
  return when(
    await canActorApproveInformationStep(db, actor, record.domainId, record.creatorEmployeeId, step),
    "Ushbu tasdiqlash bosqichi sizning vakolatingizga kirmaydi",
  );
}

export function informationRecordArchive(actor: Actor, workflow: Pick<InformationWorkflowConfig, "ownerDepartmentId">): Decision {
  return when(
    actor.roleCode === "admin"
      || (workflow.ownerDepartmentId != null && actor.departmentId === workflow.ownerDepartmentId && actor.roleLevel <= 30),
    "Yozuvni arxivlash vakolatingiz yo‘q",
  );
}

/** Y9: files attached to a sensitive field follow the field's protection (404, not 403). */
export function informationFileDownload(actor: Actor, file: { fieldCode: string | null; templateFieldsJson: unknown }): Decision {
  return when(
    !file.fieldCode || canViewSensitiveInformation(actor) || !sensitiveFieldCodes(file.templateFieldsJson).has(file.fieldCode),
    "Fayl topilmadi",
    404,
  );
}

export function informationFileUpload(actor: Actor, record: { domainEditable: boolean; status: unknown }): Decision {
  return when(
    canUploadInformationFile(actor, record.domainEditable) && isEditableRecordStatus(record.status),
    "Bu holatdagi yozuvga fayl biriktirish mumkin emas",
    409,
  );
}

export function informationFileDelete(
  actor: Actor,
  record: { domainEditable: boolean; status: unknown },
  file: { uploadedByEmployeeId: number },
): Decision {
  return when(
    canDeleteInformationFile(actor, { domainEditable: record.domainEditable, uploadedByEmployeeId: file.uploadedByEmployeeId })
      && isEditableRecordStatus(record.status),
    "Faylni o‘chirish vakolatingiz yo‘q",
  );
}

export function informationFileRevise(allowedActions: readonly string[]): Decision {
  return when(allowedActions.includes("save"), "Bu yozuv fayllarini tahrirlash vakolatingiz yo‘q");
}
