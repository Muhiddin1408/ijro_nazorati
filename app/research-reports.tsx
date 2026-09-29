"use client";

import "./styles/research.css";
import { useI18n } from "../lib/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  RefreshCw,
  Search,
} from "lucide-react";
import { readJson } from "@/lib/shared/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNotify } from "./_components/dashboard/dashboard-context";
import type { Dashboard, ModalState } from "./_components/research/research-types";
import {
  ROLE_LABELS,
  AREA_OPTIONS,
  StatusBadge,
  formatDate,
  formatNumber,
  FieldLabel,
  EmptyState,
  LoadingScreen,
  MetricCard,
} from "./_components/research/research-ui";
import { ProjectForm, SimpleActionForm } from "./_components/research/research-forms";
import { ProjectDetail } from "./_components/research/project-detail";
import {
  Overview,
  CatalogView,
  ProjectsView,
  ProblemsView,
  TopicsView,
  ForeignView,
  SearchView,
} from "./_components/research/research-views";

export function ResearchReports({ initialProjectId }: { initialProjectId?: number }) {
  const i18n = useI18n();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [modal, setModal] = useState<ModalState>(
    initialProjectId ? { type: "project", projectId: initialProjectId } : null,
  );
  const loadSequence = useRef(0);
  const loadController = useRef<AbortController | null>(null);
  const initialProjectHandled = useRef(false);
  const notify = useNotify();

  const load = useCallback(
    async (showLoading = false) => {
      const sequence = ++loadSequence.current;
      loadController.current?.abort();
      const controller = new AbortController();
      loadController.current = controller;
      if (showLoading) setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/information/research", { cache: "no-store", signal: controller.signal });
        const payload = await readJson<Dashboard>(response, "Ma’lumotlar olinmadi.");
        if (controller.signal.aborted || sequence !== loadSequence.current) return;
        setData(payload);
        if (!initialProjectHandled.current && initialProjectId) {
          initialProjectHandled.current = true;
          if (!payload.projects.some((project) => project.id === initialProjectId)) {
            setModal(null);
            notify(i18n.t("Loyiha topilmadi yoki uni ko‘rish huquqingiz yo‘q."), "error");
          }
        }
      } catch (cause) {
        if (!controller.signal.aborted && sequence === loadSequence.current) {
          setErrorMessage(cause instanceof Error ? cause.message : "Tizimga ulanishda xato.");
        }
      } finally {
        if (sequence === loadSequence.current) {
          if (loadController.current === controller) loadController.current = null;
          setLoading(false);
        }
      }
    },
    [initialProjectId, notify, i18n],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(timer);
      loadSequence.current += 1;
      loadController.current?.abort();
    };
  }, [load]);

  async function runAction(payload: Record<string, unknown>) {
    const response = await fetch("/api/information/research", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readJson<{ projectId?: number }>(response, "Amal bajarilmadi.");
    await load();
    notify(i18n.t("Ma’lumot muvaffaqiyatli saqlandi."));
    return result;
  }

  if (loading) return <LoadingScreen />;
  if (!data || errorMessage) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-2xl bg-slate-100 p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{i18n.t("Ilmiy tadqiqotlar bo‘limi ochilmadi")}</CardTitle>
            <CardDescription>{i18n.tx(errorMessage) || i18n.t("Noma’lum xato.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void load(true)}>
              <RefreshCw />
              {i18n.t("Qayta urinish")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = data.role;
  const totalBudget = data.projects.reduce((sum, item) => sum + Number(item.budget || 0), 0);
  const totalSpent = data.projects.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  const currentProject =
    modal?.type === "project" ? data.projects.find((item) => item.id === modal.projectId) : undefined;
  const currentMilestone =
    modal?.type === "stageSubmit"
      ? data.milestones.find((item) => item.projectId === modal.project.id && item.stage === modal.project.stage)
      : undefined;

  return (
    <div className="research-workspace space-y-6 text-slate-900">
      <div id="research-workspace" className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#082f55] via-[#0a4c79] to-[#0c6f72] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/15 text-white">
                  {i18n.t("Ma’lumotlar markazi · Sohani raqamlashtirish")}
                </Badge>
                <Badge className="bg-emerald-400/20 text-emerald-50">{i18n.t(ROLE_LABELS[role])}</Badge>
              </div>
              <h1 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
                {i18n.t("Ilmiy tadqiqotlar va innovatsiyalar")}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-100">
                {i18n.t(
                  "Qo‘mita loyiha pasportini yaratadi, ijrochi tashkilot bosqich natijalarini dalillar bilan yuboradi, mas’ul boshqarma tasdiqlaydi, rahbariyat esa tasdiqlangan ko‘rsatkichlarni kuzatadi.",
                )}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 text-sky-100">
                <Database className="size-4" /> {i18n.t("Ma’lumotlar saqlanmoqda")}
              </p>
              <p className="mt-1 font-semibold">
                {i18n.t("Yangilandi:")} {formatDate(data.generatedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Database}
            label="Jami loyihalar"
            value={data.projects.length}
            detail={`${data.projects.filter((item) => item.status === "active").length} tasi jarayonda`}
            accent="bg-blue-50 text-blue-700"
          />
          <MetricCard
            icon={ClipboardCheck}
            label="Tekshiruvda"
            value={
              data.projects.filter((item) => ["institute_review", "committee_review"].includes(item.status)).length
            }
            detail="Tashkilot yoki mas’ul boshqarma qarori kutilmoqda"
            accent="bg-amber-50 text-amber-700"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Yakunlangan"
            value={data.projects.filter((item) => ["completed", "implementation"].includes(item.status)).length}
            detail={`${data.projects.filter((item) => item.status === "implementation").length} tasi joriy etilmoqda`}
            accent="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            icon={CircleDollarSign}
            label="Budjet / amalda"
            value={`${formatNumber(totalSpent)} mln`}
            detail={`${formatNumber(totalBudget)} mln so‘mlik reja`}
            accent="bg-violet-50 text-violet-700"
          />
        </section>

        <Tabs defaultValue="overview" className="gap-5">
          <div className="overflow-x-auto rounded-xl border bg-white p-1 shadow-sm">
            <TabsList variant="line" className="h-11 min-w-max bg-transparent">
              <TabsTrigger value="overview">
                <LayoutDashboard />
                {i18n.t("Boshqaruv")}
              </TabsTrigger>
              <TabsTrigger value="catalog">
                <BookOpen />
                {i18n.t("Katalog")}
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FlaskConical />
                {i18n.t("Ilmiy loyihalar")}
              </TabsTrigger>
              <TabsTrigger value="problems">
                <AlertTriangle />
                {i18n.t("Muammolar")}
              </TabsTrigger>
              <TabsTrigger value="topics">
                <Lightbulb />
                {i18n.t("Tavsiya mavzular")}
              </TabsTrigger>
              <TabsTrigger value="foreign">
                <Globe2 />
                {i18n.t("Xorijiy tajriba")}
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search />
                {i18n.t("Aqlli qidiruv")}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview">
            <Overview data={data} openProject={(project) => setModal({ type: "project", projectId: project.id })} />
          </TabsContent>
          <TabsContent value="catalog">
            <CatalogView data={data} openProject={(project) => setModal({ type: "project", projectId: project.id })} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsView
              data={data}
              openProject={(project) => setModal({ type: "project", projectId: project.id })}
              createProject={() => setModal({ type: "projectForm" })}
            />
          </TabsContent>
          <TabsContent value="problems">
            <ProblemsView data={data} onOpen={setModal} />
          </TabsContent>
          <TabsContent value="topics">
            <TopicsView data={data} onOpen={setModal} />
          </TabsContent>
          <TabsContent value="foreign">
            <ForeignView data={data} onOpen={setModal} />
          </TabsContent>
          <TabsContent value="search">
            <SearchView data={data} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        {currentProject ? (
          <ProjectDetail
            project={currentProject}
            data={data}
            onClose={() => setModal(null)}
            onAction={runAction}
            onOpen={setModal}
            reload={load}
          />
        ) : null}
        {modal?.type === "projectForm" ? (
          <ProjectForm
            project={modal.project}
            prefill={modal.prefill}
            directory={data.directory}
            onClose={() => setModal(null)}
            onSaved={runAction}
          />
        ) : null}
        {modal?.type === "stageSubmit" ? (
          <SimpleActionForm
            title={i18n.t("{stage}-bosqich natijasini yuborish", { stage: modal.project.stage })}
            description="Natija, KPI va xarajatni kiriting. Dalil fayli aynan joriy bosqichga yuklangan bo‘lishi kerak."
            submitLabel="Tashkilot tekshiruviga yuborish"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              const values = Object.fromEntries(form.entries());
              await runAction({
                action: "submit_stage",
                id: modal.project.id,
                version: modal.project.version,
                summary: values.summary,
                kpi: values.kpi,
                expenditure: Number(values.expenditure || 0),
              });
            }}
          >
            {currentMilestone?.reviewerComment ? (
              <div className="info-alert sm:col-span-2" role="status">
                {i18n.t("Qaytarish izohi:")} {i18n.tx(currentMilestone.reviewerComment)}
              </div>
            ) : null}
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="stage-summary">{i18n.t("Bajarilgan ishlar *")}</FieldLabel>
              <Textarea
                id="stage-summary"
                name="summary"
                required
                minLength={20}
                defaultValue={currentMilestone?.resultSummary ?? ""}
                className="min-h-28"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="stage-kpi">{i18n.t("Erishilgan natija / KPI *")}</FieldLabel>
              <Input id="stage-kpi" name="kpi" required defaultValue={currentMilestone?.kpiValue ?? ""} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="stage-expense">{i18n.t("Davr xarajati, mln so‘m")}</FieldLabel>
              <Input
                id="stage-expense"
                name="expenditure"
                type="number"
                min="0"
                step="any"
                defaultValue={currentMilestone?.expenditure ?? 0}
              />
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "stageVerify" ? (
          <SimpleActionForm
            title={i18n.t("{stage}-bosqich tashkilot xulosasi", { stage: modal.project.stage })}
            description="Natijani uni yuborgan mas’ul xodimdan boshqa tashkilot tekshiruvchisi ko‘rib chiqadi."
            submitLabel="Xulosani saqlash"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              const values = Object.fromEntries(form.entries());
              await runAction({
                action: "verify_stage",
                id: modal.project.id,
                version: modal.project.version,
                decision: values.decision,
                comment: values.comment,
              });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="verify-decision">{i18n.t("Qaror *")}</FieldLabel>
              <Select name="decision" defaultValue="approve">
                <SelectTrigger id="verify-decision" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">{i18n.t("Qo‘mitaga yuborish")}</SelectItem>
                  <SelectItem value="return">{i18n.t("Mas’ul xodimga qaytarish")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="verify-comment">{i18n.t("Tashkilot xulosasi")}</FieldLabel>
              <Textarea
                id="verify-comment"
                name="comment"
                className="min-h-28"
                placeholder={i18n.t("Qaytarishda kamida 10 ta belgi...")}
              />
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "stageReview" ? (
          <SimpleActionForm
            title={i18n.t("{stage}-bosqich Qo‘mita qarori", { stage: modal.project.stage })}
            description="Tasdiqlansa rasmiy progress yangilanadi; qaytarishda sabab majburiy."
            submitLabel="Qarorni saqlash"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              const values = Object.fromEntries(form.entries());
              await runAction({
                action: "review_stage",
                id: modal.project.id,
                version: modal.project.version,
                decision: values.decision,
                comment: values.comment,
              });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="review-decision">{i18n.t("Qaror *")}</FieldLabel>
              <Select name="decision" defaultValue="approve">
                <SelectTrigger id="review-decision" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">{i18n.t("Tasdiqlash")}</SelectItem>
                  <SelectItem value="return">{i18n.t("Tuzatishga qaytarish")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="review-comment">{i18n.t("Tekshiruvchi izohi")}</FieldLabel>
              <Textarea
                id="review-comment"
                name="comment"
                className="min-h-28"
                placeholder={i18n.t("Qaytarishda kamida 10 ta belgi...")}
              />
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "archive" ? (
          <SimpleActionForm
            title={i18n.t("Loyihani arxivlash")}
            description="Tarix va barcha ma’lumotlar saqlanadi."
            submitLabel="Arxivlash"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              await runAction({
                action: "archive_project",
                id: modal.project.id,
                version: modal.project.version,
                comment: form.get("comment"),
              });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="archive-comment">{i18n.t("Arxivlash sababi *")}</FieldLabel>
              <Textarea id="archive-comment" name="comment" required minLength={10} />
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "problemForm" ? (
          <SimpleActionForm
            title={i18n.t("Yangi amaliy muammo")}
            description="Ilmiy tashkilotlar yechim arizasini yuborishi uchun muammoni e’lon qiling."
            submitLabel="Muammoni e’lon qilish"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              await runAction({ action: "create_problem", ...Object.fromEntries(form.entries()) });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="problem-title">{i18n.t("Muammo nomi *")}</FieldLabel>
              <Input id="problem-title" name="title" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="problem-area">{i18n.t("Yo‘nalish *")}</FieldLabel>
              <Select name="area" defaultValue="Qoplama">
                <SelectTrigger id="problem-area" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_OPTIONS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {i18n.tx(area)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="problem-source">{i18n.t("Manba tashkilot *")}</FieldLabel>
              <Select name="sourceOrganizationId" required>
                <SelectTrigger id="problem-source" className="w-full">
                  <SelectValue placeholder={i18n.t("Tashkilotni tanlang")} />
                </SelectTrigger>
                <SelectContent>
                  {data.directory.sourceOrganizations.map((organization) => (
                    <SelectItem key={organization.id} value={String(organization.id)}>
                      {i18n.tx(organization.shortName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="problem-desc">{i18n.t("Muammo tavsifi *")}</FieldLabel>
              <Textarea id="problem-desc" name="description" required />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="problem-result">{i18n.t("Kutilayotgan natija *")}</FieldLabel>
              <Textarea id="problem-result" name="expectedResult" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="problem-deadline">{i18n.t("Ariza muddati *")}</FieldLabel>
              <Input id="problem-deadline" name="deadline" type="date" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="problem-priority">{i18n.t("Ustuvorlik")}</FieldLabel>
              <Select name="priority" defaultValue="high">
                <SelectTrigger id="problem-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">{i18n.t("O‘rta")}</SelectItem>
                  <SelectItem value="high">{i18n.t("Yuqori")}</SelectItem>
                  <SelectItem value="very_high">{i18n.t("Juda yuqori")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "proposal" ? (
          <SimpleActionForm
            title={i18n.t("Ilmiy yechim arizasi")}
            description={`${modal.problem.title}. Arizachi va tashkilot tizimdagi hisobdan avtomatik olinadi.`}
            submitLabel="Arizani yuborish"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              await runAction({
                action: "submit_proposal",
                problemId: modal.problem.id,
                ...Object.fromEntries(form.entries()),
              });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="proposal-title">{i18n.t("Yechim nomi *")}</FieldLabel>
              <Input id="proposal-title" name="solutionTitle" required />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="proposal-summary">{i18n.t("Yechim tavsifi *")}</FieldLabel>
              <Textarea id="proposal-summary" name="summary" required className="min-h-28" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="proposal-effect">{i18n.t("Kutilayotgan samara *")}</FieldLabel>
              <Textarea id="proposal-effect" name="expectedEffect" required />
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "problem" ? (
          <DialogContent className="research-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{modal.problem.code}</Badge>
                <StatusBadge status={modal.problem.status} />
              </div>
              <DialogTitle className="mt-2 leading-7">{i18n.tx(modal.problem.title)}</DialogTitle>
              <DialogDescription>{i18n.tx(modal.problem.sourceOrganization)}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500">{i18n.t("Muammo")}</p>
                <p className="mt-2 text-sm leading-6">{i18n.tx(modal.problem.description)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">{i18n.t("Kutilayotgan natija")}</p>
                <p className="mt-2 text-sm leading-6">{i18n.tx(modal.problem.expectedResult)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">{i18n.t("Ariza muddati")}</p>
                <p className="mt-2 text-sm font-semibold">{formatDate(modal.problem.deadline)}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">
                {i18n.t("Yechim takliflari (")}
                {modal.problem.proposalCount})
              </h3>
              <div className="space-y-3">
                {data.proposals
                  .filter((item) => item.problemId === modal.problem.id)
                  .map((proposal) => (
                    <div key={proposal.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">{i18n.t(proposal.solutionTitle)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {i18n.tx(proposal.organization)} · {i18n.tx(proposal.applicant)}
                          </p>
                        </div>
                        <StatusBadge status={proposal.status} />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{i18n.tx(proposal.summary)}</p>
                      {data.capabilities.selectIntake && proposal.status === "submitted" ? (
                        <Button
                          className="mt-3"
                          size="sm"
                          onClick={() =>
                            setModal({
                              type: "projectForm",
                              prefill: {
                                title: proposal.solutionTitle,
                                area: modal.problem.area,
                                problem: modal.problem.description,
                                objective: proposal.summary,
                                expectedResult: proposal.expectedEffect,
                                origin: "problem",
                                sourceIntakeId: proposal.id,
                              },
                            })
                          }
                        >
                          <CheckCircle2 />
                          {i18n.t("G‘olib sifatida loyiha ochish")}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                {!data.proposals.some((item) => item.problemId === modal.problem.id) ? (
                  <EmptyState
                    icon={Lightbulb}
                    title={i18n.t("Taklif kelmagan")}
                    text="Ilmiy tashkilot yechim arizasini yuborgach, u shu yerda ko‘rinadi."
                  />
                ) : null}
              </div>
            </div>
          </DialogContent>
        ) : null}
        {modal?.type === "topicForm" ? (
          <SimpleActionForm
            title={i18n.t("Tavsiya mavzu qo‘shish")}
            description="Amaliy ehtiyoj va manba tashkilot bilan kiriting."
            submitLabel="Mavzuni saqlash"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              await runAction({ action: "create_topic", ...Object.fromEntries(form.entries()) });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="topic-title">{i18n.t("Mavzu nomi *")}</FieldLabel>
              <Input id="topic-title" name="title" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="topic-area">{i18n.t("Yo‘nalish *")}</FieldLabel>
              <Select name="area" defaultValue="Qoplama">
                <SelectTrigger id="topic-area" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_OPTIONS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {i18n.tx(area)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="topic-source">{i18n.t("Manba tashkilot *")}</FieldLabel>
              <Select name="sourceOrganizationId" required>
                <SelectTrigger id="topic-source" className="w-full">
                  <SelectValue placeholder={i18n.t("Tashkilotni tanlang")} />
                </SelectTrigger>
                <SelectContent>
                  {data.directory.sourceOrganizations.map((organization) => (
                    <SelectItem key={organization.id} value={String(organization.id)}>
                      {i18n.tx(organization.shortName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="topic-rationale">{i18n.t("Mavzu asosi va amaliy ehtiyoj *")}</FieldLabel>
              <Textarea id="topic-rationale" name="rationale" required className="min-h-28" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="topic-priority">{i18n.t("Ustuvorlik")}</FieldLabel>
              <Select name="priority" defaultValue="high">
                <SelectTrigger id="topic-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">{i18n.t("O‘rta")}</SelectItem>
                  <SelectItem value="high">{i18n.t("Yuqori")}</SelectItem>
                  <SelectItem value="very_high">{i18n.t("Juda yuqori")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SimpleActionForm>
        ) : null}
        {modal?.type === "foreignForm" ? (
          <SimpleActionForm
            title={i18n.t("Xorijiy innovatsion loyiha")}
            description="Yechim manbasi, samarasi va mahalliylashtirish taklifini kiriting."
            submitLabel="Yechimni saqlash"
            onClose={() => setModal(null)}
            onSubmit={async (form) => {
              const values = Object.fromEntries(form.entries());
              await runAction({ action: "create_foreign", ...values, readiness: Number(values.readiness) });
            }}
          >
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="foreign-title">{i18n.t("Loyiha nomi *")}</FieldLabel>
              <Input id="foreign-title" name="title" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="foreign-country">{i18n.t("Mamlakat *")}</FieldLabel>
              <Input id="foreign-country" name="country" required />
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="foreign-area">{i18n.t("Yo‘nalish *")}</FieldLabel>
              <Select name="area" defaultValue="Yo‘l diagnostikasi">
                <SelectTrigger id="foreign-area" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_OPTIONS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {i18n.tx(area)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="foreign-impact">{i18n.t("Asosiy samara *")}</FieldLabel>
              <Textarea id="foreign-impact" name="impact" required />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="foreign-adaptation">{i18n.t("O‘zbekistonga moslashtirish *")}</FieldLabel>
              <Textarea id="foreign-adaptation" name="adaptation" required />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="foreign-readiness">{i18n.t("Mahalliylashtirish tayyorgarligi, % *")}</FieldLabel>
              <Input id="foreign-readiness" name="readiness" type="number" min="0" max="100" required />
            </div>
          </SimpleActionForm>
        ) : null}
      </Dialog>
    </div>
  );
}
