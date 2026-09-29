import { readSource } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const {
  canAdministerAnyReport,
  canDelegateReportStatus,
  canDeleteInformationFile,
  canManageReportTemplateFile,
  canMutateMeeting,
  canReviewReport,
  canSubmitOrDelegateReport,
  canUploadInformationFile,
} = await import("../lib/mutation-authority.ts");

function actor(id, overrides = {}) {
  return {
    id,
    departmentId: null,
    permissions: {
      viewScope: "own", assignScope: "none", canCreateTask: false, canCreateMeeting: false,
      canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false,
      canViewAudit: false, canUpdateAnyTask: false, canManageReports: false,
      canManageInformation: false, canViewRestrictedInformation: false, informationScope: "assigned",
      canEnterInformation: false, canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false,
    },
    ...overrides,
  };
}

test("global report visibility never grants submit, delegation or evidence mutation", () => {
  const globalViewer = actor(10, { permissions: { ...actor(10).permissions, viewScope: "all", canManageReports: true } });
  const responsible = actor(20);
  const explicitAdmin = actor(30, { permissions: { ...actor(30).permissions, viewScope: "all", canManageRoles: true, canManageReports: true } });

  assert.equal(canSubmitOrDelegateReport(globalViewer, responsible.id), false);
  assert.equal(canManageReportTemplateFile(globalViewer, { templateCreatorEmployeeId: 99, ownerDepartmentId: 8 }), false);
  assert.equal(canSubmitOrDelegateReport(responsible, responsible.id), true);
  assert.equal(canAdministerAnyReport(explicitAdmin), true);
  assert.equal(canSubmitOrDelegateReport(explicitAdmin, responsible.id), true);
});

test("report review is limited to the parent, creator or exact owner department manager", () => {
  const context = { templateCreatorEmployeeId: 40, ownerDepartmentId: 7, parentResponsibleEmployeeId: 50, responsibleEmployeeId: 70, submittedByEmployeeId: 70 };
  assert.equal(canReviewReport(actor(40), context), true);
  assert.equal(canReviewReport(actor(50), context), true);
  assert.equal(canReviewReport(actor(60, { departmentId: 7, permissions: { ...actor(60).permissions, canManageReports: true } }), context), true);
  assert.equal(canReviewReport(actor(61, { departmentId: 8, permissions: { ...actor(61).permissions, viewScope: "all", canManageReports: true } }), context), false);
  assert.equal(canReviewReport(actor(62, { permissions: { ...actor(62).permissions, viewScope: "all" } }), context), false);
});

test("report review is never self-approval (audit Y8)", () => {
  const selfOwned = { templateCreatorEmployeeId: 40, ownerDepartmentId: 7, parentResponsibleEmployeeId: 50, responsibleEmployeeId: 40, submittedByEmployeeId: 40 };
  assert.equal(canReviewReport(actor(40), selfOwned), false);
  assert.equal(canReviewReport(actor(50), selfOwned), true);
  const submittedByParent = { ...selfOwned, responsibleEmployeeId: 70, submittedByEmployeeId: 50 };
  assert.equal(canReviewReport(actor(50), submittedByParent), false);
  const manager = actor(60, { departmentId: 7, permissions: { ...actor(60).permissions, canManageReports: true } });
  assert.equal(canReviewReport(manager, { ...selfOwned, responsibleEmployeeId: 60, submittedByEmployeeId: 60 }), false);
});

test("delegation is blocked once a report has been submitted or approved", () => {
  for (const status of ["new", "collecting", "returned"]) assert.equal(canDelegateReportStatus(status), true);
  for (const status of ["submitted", "approved", "archived", ""]) assert.equal(canDelegateReportStatus(status), false);
});

test("meeting mutation is organizer-only with an explicit administrator override", () => {
  const organizer = actor(70, { permissions: { ...actor(70).permissions, canCreateMeeting: true } });
  const leadershipViewer = actor(71, { permissions: { ...actor(71).permissions, viewScope: "all", canCreateMeeting: true } });
  const administrator = actor(72, { permissions: { ...actor(72).permissions, viewScope: "all", canCreateMeeting: true, canManageRoles: true } });
  assert.equal(canMutateMeeting(organizer, organizer.id), true);
  assert.equal(canMutateMeeting(leadershipViewer, organizer.id), false);
  assert.equal(canMutateMeeting(administrator, organizer.id), true);
});

test("read-all leadership cannot mutate information attachments", () => {
  const leadership = actor(80, { permissions: {
    ...actor(80).permissions, viewScope: "all", canEnterInformation: true, canManageInformation: true,
  } });
  const editor = actor(81, { permissions: { ...actor(81).permissions, canEnterInformation: true } });
  const administrator = actor(82, { permissions: {
    ...actor(82).permissions, viewScope: "all", canEnterInformation: true, canManageInformation: true, canManageRoles: true,
  } });
  assert.equal(canUploadInformationFile(leadership, false), false);
  assert.equal(canDeleteInformationFile(leadership, { domainEditable: false, uploadedByEmployeeId: 90 }), false);
  assert.equal(canDeleteInformationFile(leadership, { domainEditable: true, uploadedByEmployeeId: 90 }), false);
  assert.equal(canDeleteInformationFile(editor, { domainEditable: true, uploadedByEmployeeId: editor.id }), true);
  assert.equal(canDeleteInformationFile(editor, { domainEditable: true, uploadedByEmployeeId: 90 }), false);
  assert.equal(canDeleteInformationFile(administrator, { domainEditable: true, uploadedByEmployeeId: 90 }), true);
});

test("state-changing routes use explicit mutation authority rather than view scope", async () => {
  const [reports, reportFiles, meetings] = await Promise.all([
    readSource(new URL("../app/api/reports/route.ts", import.meta.url)),
    readSource(new URL("../app/api/reports/files/route.ts", import.meta.url)),
    Promise.all([
      readSource(new URL("../app/api/meetings/route.ts", import.meta.url)),
      readFile(new URL("../lib/policy/meetings.ts", import.meta.url), "utf8"),
    ]).then((sources) => sources.join("\n")),
  ]);
  assert.match(reports, /canSubmitOrDelegateReport/);
  assert.match(reports, /canReviewReport/);
  assert.match(reports, /canDelegateReportStatus/);
  assert.doesNotMatch(reports, /responsible_employee_id\) !== actor\.id && actor\.permissions\.viewScope !== "all"/);
  assert.match(reportFiles, /canManageReportTemplateFile/);
  assert.match(reportFiles, /canSubmitOrDelegateReport/);
  assert.doesNotMatch(reportFiles, /responsible_employee_id !== actor\.id && actor\.permissions\.viewScope !== "all"/);
  assert.match(meetings, /canMutateMeeting/);
  assert.doesNotMatch(meetings, /created_by_employee_id\) !== actor\.id && actor\.permissions\.viewScope !== "all"/);
});
