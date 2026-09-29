import { apiError, requireActor } from "../../../lib/auth";
import { directoryBranches, searchDirectory, type DirectoryScope } from "../../../lib/directory";

const scopes = new Set<DirectoryScope>(["chat", "task", "meeting", "staff"]);

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const url = new URL(request.url);
    const scope = scopes.has(url.searchParams.get("scope") as DirectoryScope)
      ? (url.searchParams.get("scope") as DirectoryScope)
      : "chat";
    if (url.searchParams.get("kind") === "branches") {
      const parentValue = url.searchParams.get("parentId");
      return Response.json(
        { organizations: await directoryBranches(actor, parentValue ? Number(parentValue) : null) },
        {
          headers: { "Cache-Control": "private, max-age=30", Vary: "Cookie" },
        },
      );
    }
    const result = await searchDirectory(actor, {
      scope,
      q: url.searchParams.get("q") ?? "",
      organizationId: Number(url.searchParams.get("organizationId")) || null,
      departmentId: Number(url.searchParams.get("departmentId")) || null,
      cursor: Number(url.searchParams.get("cursor")) || 0,
      limit: Number(url.searchParams.get("limit")) || 25,
    });
    return Response.json(result, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch (error) {
    return apiError(error);
  }
}
