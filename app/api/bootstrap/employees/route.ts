import { activeEmployees, apiError, requireActor, scopedEmployeeIds } from "../../../../lib/auth";
import { jsonWithEtag } from "../../../../lib/shared/etag";

export const dynamic = "force-dynamic";

const DIRECTORY_LIMIT = 500;

/**
 * Employee directory for admin pages and pickers, loaded only when a screen
 * needs it (split out of /api/bootstrap to keep the first screen light).
 */
export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const systemWideDirectory =
      actor.permissions.viewScope === "all" || actor.permissions.canManageRoles || actor.permissions.canConfigure;
    const [assignableEmployeeIds, viewEmployeeIds] = await Promise.all([
      actor.permissions.assignScope === "all"
        ? Promise.resolve([])
        : scopedEmployeeIds(actor, actor.permissions.assignScope, DIRECTORY_LIMIT),
      actor.permissions.viewScope === "all"
        ? Promise.resolve([])
        : scopedEmployeeIds(actor, actor.permissions.viewScope, DIRECTORY_LIMIT),
    ]);
    const assignableIds = new Set(assignableEmployeeIds);
    const directoryIds = new Set([actor.id, ...viewEmployeeIds, ...assignableIds]);
    const allEmployees = await activeEmployees(systemWideDirectory ? undefined : [...directoryIds], DIRECTORY_LIMIT);
    if (actor.permissions.assignScope === "all") {
      for (const employee of allEmployees) if (employee.active) assignableIds.add(employee.id);
    }
    assignableIds.delete(actor.id);
    const employees = allEmployees
      .filter((employee) => systemWideDirectory || (employee.active && directoryIds.has(employee.id)))
      .map((employee) =>
        systemWideDirectory || actor.permissions.canManageOrganization
          ? employee
          : {
              ...employee,
              email: "",
              birthDate: null,
              mobilePhone: null,
              fullNameCyrillic: null,
              sourceEmployeeNumber: null,
              sourceRow: null,
              telegramLinked: false,
              telegramUsername: null,
            },
      );
    return jsonWithEtag(request, {
      employees,
      assignableEmployeeIds: [...assignableIds],
      truncated: allEmployees.length >= DIRECTORY_LIMIT,
    });
  } catch (error) {
    return apiError(error);
  }
}
