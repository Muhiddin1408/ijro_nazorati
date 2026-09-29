"use client";

import { useI18n } from "../../../lib/i18n";
import { Archive, ArrowRight, ClipboardCheck, Download, FileText, Pencil, Target, Upload } from "lucide-react";
import { useNotify } from "../dashboard/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Role, Project, Dashboard, ModalState } from "./research-types";
import {
  ROLE_LABELS,
  StatusBadge,
  formatDate,
  formatNumber,
  formatFileSize,
  deadlineLabel,
  EmptyState,
} from "./research-ui";
import { FileUploader } from "./research-forms";

export function ProjectDetail({
  project,
  data,
  onClose,
  onAction,
  onOpen,
  reload,
}: {
  project: Project;
  data: Dashboard;
  onClose: () => void;
  onAction: (payload: Record<string, unknown>) => Promise<unknown>;
  onOpen: (modal: ModalState) => void;
  reload: () => Promise<void>;
}) {
  const i18n = useI18n();
  const notify = useNotify();
  const milestones = data.milestones.filter((item) => item.projectId === project.id);
  const attachments = data.attachments.filter((item) => item.projectId === project.id);
  const events = data.events.filter((item) => item.projectId === project.id);
  const current = milestones.find((item) => item.stage === project.stage);
  const deadline = deadlineLabel(project);
  const budgetPercent = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;

  async function activate() {
    try {
      await onAction({ action: "activate_project", id: project.id, version: project.version });
      onClose();
    } catch (cause) {
      notify(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Loyiha ijroga yuborilmadi."), "error");
    }
  }

  async function implement() {
    try {
      await onAction({ action: "start_implementation", id: project.id, version: project.version });
      onClose();
    } catch (cause) {
      notify(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Amal bajarilmadi."), "error");
    }
  }

  return (
    <DialogContent className="research-dialog-content max-h-[94vh] overflow-y-auto p-0 sm:max-w-5xl">
      <div className="border-b bg-gradient-to-r from-[#0a3158] to-[#0b5a7b] px-6 py-6 text-white sm:px-8">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/15 text-white">{project.code}</Badge>
            <StatusBadge status={project.status} />
            {deadline ? (
              <Badge className={deadline.tone === "danger" ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-900"}>
                {i18n.t(deadline.label, { days: deadline.days })}
              </Badge>
            ) : null}
          </div>
          <DialogTitle className="mt-3 max-w-3xl text-xl leading-snug text-white sm:text-2xl">
            {i18n.tx(project.title)}
          </DialogTitle>
          <DialogDescription className="text-sky-100">
            {i18n.tx(project.organization)} · {i18n.tx(project.leader)}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-6 px-6 pb-7 sm:px-8">
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{i18n.t("Yo‘nalish")}</p>
            <p className="mt-1 text-sm font-semibold">{i18n.tx(project.area)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{i18n.t("Muddat")}</p>
            <p className="mt-1 text-sm font-semibold">
              {formatDate(project.startDate)} — {formatDate(project.endDate)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{i18n.t("Budjet")}</p>
            <p className="mt-1 text-sm font-semibold">
              {formatNumber(project.spent)} / {formatNumber(project.budget)} {i18n.t("mln")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{i18n.t("Mas’ul boshqarma")}</p>
            <p className="mt-1 text-sm font-semibold">{i18n.tx(project.coordinator)}</p>
          </div>
        </div>

        <Tabs defaultValue="passport">
          <TabsList className="h-auto w-full justify-start overflow-x-auto bg-slate-100 p-1">
            <TabsTrigger value="passport">{i18n.t("Pasport")}</TabsTrigger>
            <TabsTrigger value="stages">{i18n.t("Reja va bosqichlar")}</TabsTrigger>
            <TabsTrigger value="files">
              {i18n.t("Natija va fayllar (")}
              {attachments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              {i18n.t("Tarix (")}
              {events.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passport" className="mt-5 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{i18n.t("Tasdiqlangan progress")}</span>
                <span className="font-bold text-[#0a4c8c]">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2.5" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                ["Yechiladigan muammo", project.problem],
                ["Maqsad", project.objective],
                ["Ilmiy yangilik", project.novelty || "Aniqlashtirilmoqda"],
                ["Kutilayotgan natija", project.expectedResult],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{i18n.t(label)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{i18n.tx(value)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{i18n.t("Budjet o‘zlashtirilishi")}</span>
                <span>{budgetPercent}%</span>
              </div>
              <Progress value={budgetPercent} className="h-2" />
            </div>
          </TabsContent>

          <TabsContent value="stages" className="mt-5 space-y-3">
            {milestones.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${item.stage === project.stage ? "border-blue-300 bg-blue-50/50" : "bg-white"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${item.status === "approved" ? "bg-emerald-600 text-white" : item.stage === project.stage ? "bg-[#0a4c8c] text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      {item.status === "approved" ? "✓" : item.stage}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{i18n.tx(item.name)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {i18n.t("Reja:")} {formatDate(item.plannedDate)}
                        {item.actualDate
                          ? i18n.t(" · Bajarildi: {p0}", { p0: i18n.tx(formatDate(item.actualDate)) })
                          : ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.resultSummary ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {i18n.tx(item.resultSummary)}
                  </p>
                ) : null}
                {item.reviewerComment ? (
                  <p className="mt-2 text-xs text-amber-800">
                    <b>{i18n.t("Tekshiruvchi izohi:")}</b> {i18n.tx(item.reviewerComment)}
                  </p>
                ) : null}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="files" className="mt-5 space-y-4">
            <FileUploader project={project} milestone={current} onUploaded={reload} />
            {attachments.length ? (
              <div className="divide-y rounded-xl border bg-white">
                {attachments.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                        <FileText />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatFileSize(item.sizeBytes)} · {i18n.tx(item.uploadedBy)} · {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={`/api/information/research/files?id=${item.id}`}>
                        <Download />
                        {i18n.t("Yuklab olish")}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title={i18n.t("Fayl biriktirilmagan")}
                text="Loyiha pasporti, sinov bayonnomasi yoki natija hujjatini yuklang."
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-5">
            {events.length ? (
              <div className="space-y-3">
                {events.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border bg-white p-4">
                    <div className="mt-0.5 size-2 shrink-0 rounded-full bg-[#0a4c8c]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{i18n.tx(item.actorName)}</p>
                      <p className="mt-1 text-sm text-slate-600">{i18n.tx(item.comment)}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {i18n.t(ROLE_LABELS[item.actorRole as Role]) ?? i18n.tx(item.actorRole)} ·{" "}
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title={i18n.t("Tarix hali bo‘sh")}
                text="Loyiha bo‘yicha bajarilgan amallar shu yerda qayd etiladi."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
          {project.capabilities.edit ? (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onOpen({ type: "projectForm", project });
              }}
            >
              <Pencil />
              {i18n.t("Pasportni tahrirlash")}
            </Button>
          ) : null}
          {project.capabilities.activate ? (
            <Button onClick={activate}>
              <ArrowRight />
              {i18n.t("Ijroga yuborish")}
            </Button>
          ) : null}
          {project.capabilities.contribute ? (
            <Button
              onClick={() => {
                onClose();
                onOpen({ type: "stageSubmit", project });
              }}
            >
              <Upload />
              {i18n.t("Bosqich natijasini yuborish")}
            </Button>
          ) : null}
          {project.capabilities.verify ? (
            <Button
              onClick={() => {
                onClose();
                onOpen({ type: "stageVerify", project });
              }}
            >
              <ClipboardCheck />
              {i18n.t("Tashkilot xulosasi")}
            </Button>
          ) : null}
          {project.capabilities.review ? (
            <Button
              onClick={() => {
                onClose();
                onOpen({ type: "stageReview", project });
              }}
            >
              <ClipboardCheck />
              {i18n.t("Qo‘mita qarori")}
            </Button>
          ) : null}
          {project.capabilities.implement ? (
            <Button onClick={implement}>
              <Target />
              {i18n.t("Joriy etishga o‘tkazish")}
            </Button>
          ) : null}
          {project.capabilities.archive ? (
            <Button
              variant="outline"
              className="text-rose-700"
              onClick={() => {
                onClose();
                onOpen({ type: "archive", project });
              }}
            >
              <Archive />
              {i18n.t("Arxivlash")}
            </Button>
          ) : null}
        </div>
      </div>
    </DialogContent>
  );
}
