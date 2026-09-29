"use client";

import { useI18n } from "../../../lib/i18n";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Lightbulb,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Project, Dashboard, ModalState, SearchResult } from "./research-types";
import { StatusBadge, formatDate, formatNumber, daysUntil, deadlineLabel, normalize, EmptyState } from "./research-ui";

export function Overview({ data, openProject }: { data: Dashboard; openProject: (project: Project) => void }) {
  const i18n = useI18n();
  const review = data.projects.filter((item) => ["institute_review", "committee_review"].includes(item.status));
  const atRisk = data.projects
    .filter((item) => deadlineLabel(item))
    .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate));
  const stages = [
    { label: "Qoralama", statuses: ["draft"] },
    { label: "Jarayonda", statuses: ["active", "returned"] },
    { label: "Tekshiruvda", statuses: ["institute_review", "committee_review"] },
    { label: "Yakunlangan", statuses: ["completed"] },
    { label: "Joriy etishda", statuses: ["implementation"] },
  ] as const;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <Card className="gap-0 py-0 shadow-sm">
        <CardHeader className="border-b py-5">
          <CardTitle>{i18n.t("Loyihalar oqimi")}</CardTitle>
          <CardDescription>{i18n.t("Holatlar bo‘yicha real taqsimot")}</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 sm:grid-cols-5">
            {stages.map((stage, index) => (
              <div key={stage.label} className="relative rounded-xl border bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {data.projects.filter((item) => stage.statuses.includes(item.status as never)).length}
                </p>
                <p className="mt-1 text-xs text-slate-500">{i18n.t(stage.label)}</p>
                {index < stages.length - 1 ? (
                  <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-white text-slate-300 sm:block" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{i18n.t("Tekshiruv kutilayotgan bosqichlar")}</h3>
              <Badge variant="outline">
                {review.length} {i18n.t("ta")}
              </Badge>
            </div>
            {review.length ? (
              <div className="divide-y rounded-xl border">
                {review.slice(0, 4).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => openProject(project)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{i18n.tx(project.title)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {i18n.tx(project.organization)} · {project.stage}
                        {i18n.t("-bosqich")}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                {i18n.t("Tekshiruv navbati bo‘sh.")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 shadow-sm">
        <CardHeader className="border-b py-5">
          <CardTitle>{i18n.t("Muddat nazorati")}</CardTitle>
          <CardDescription>{i18n.t("Kechikkan va 30 kun ichida tugaydigan loyihalar")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {atRisk.length ? (
            atRisk.slice(0, 6).map((project) => {
              const deadline = deadlineLabel(project)!;
              return (
                <button
                  key={project.id}
                  onClick={() => openProject(project)}
                  className="w-full rounded-xl border bg-white p-4 text-left hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-semibold">{i18n.tx(project.title)}</p>
                    <AlertTriangle
                      className={`size-4 shrink-0 ${deadline.tone === "danger" ? "text-rose-600" : "text-amber-600"}`}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{formatDate(project.endDate)}</span>
                    <span
                      className={
                        deadline.tone === "danger" ? "font-semibold text-rose-700" : "font-semibold text-amber-700"
                      }
                    >
                      {i18n.t(deadline.label, { days: deadline.days })}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title={data.projects.length ? i18n.t("Xavfli muddat yo‘q") : i18n.t("Loyiha hali kiritilmagan")}
              text={
                data.projects.length
                  ? "Barcha faol loyihalarning muddati nazoratda."
                  : "Birinchi loyiha yaratilgach, muddat nazorati shu yerda paydo bo‘ladi."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function catalogDetails(values: Record<string, unknown>) {
  return Object.entries(values)
    .filter(([, value]) => ["string", "number"].includes(typeof value) && String(value).trim())
    .slice(0, 3)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value)}`);
}

export function CatalogView({ data, openProject }: { data: Dashboard; openProject: (project: Project) => void }) {
  const i18n = useI18n();
  const completed = data.projects.filter((project) => ["completed", "implementation"].includes(project.status));
  const recommended = completed.find((project) => project.status === "implementation") ?? completed[0];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{i18n.t("Mavjud ilmiy tadqiqotlar va innovatsiyalar")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {i18n.t("Yakuniy tasdiqdan o‘tgan loyihalar va mavjud “Ilmiy ishlar” reyestridagi nashr qilingan yozuvlar")}
        </p>
      </div>
      {recommended ? (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-700 text-white">{i18n.t("Joriy etish uchun tanlangan")}</Badge>
              <StatusBadge status={recommended.status} />
            </div>
            <CardTitle className="mt-3">{i18n.tx(recommended.title)}</CardTitle>
            <CardDescription>
              {i18n.tx(recommended.organization)} · {i18n.tx(recommended.leader)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm leading-6 text-slate-700">{i18n.tx(recommended.expectedResult)}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {i18n.t("Tasdiqlangan progress:")} {recommended.progress}
                  {i18n.t("% · Budjet:")} {formatNumber(recommended.budget)} {i18n.t("mln so‘m")}
                </p>
              </div>
              <Button onClick={() => openProject(recommended)}>
                <ArrowRight />
                {i18n.t("Kartani ochish")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {completed.map((project) => (
          <button
            key={`project-${project.id}`}
            onClick={() => openProject(project)}
            className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline">
                {project.kind === "innovation"
                  ? i18n.t("Innovatsiya")
                  : project.kind === "pilot"
                    ? i18n.t("Pilot")
                    : i18n.t("Ilmiy tadqiqot")}
              </Badge>
              <StatusBadge status={project.status} />
            </div>
            <h3 className="mt-4 font-semibold leading-6 text-slate-900">{i18n.tx(project.title)}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{i18n.tx(project.expectedResult)}</p>
            <p className="mt-4 text-xs text-slate-500">
              {i18n.tx(project.organization)} · {formatDate(project.updatedAt)}
            </p>
          </button>
        ))}
        {data.catalog.map((record) => {
          const details = catalogDetails(record.values);
          return (
            <article key={`catalog-${record.id}`} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                  {i18n.t("Rasmiy reyestr")}
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700">{i18n.t("Nashr qilingan")}</Badge>
              </div>
              <h3 className="mt-4 font-semibold leading-6 text-slate-900">{i18n.tx(record.title)}</h3>
              {details.length ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {details.map((detail) => (
                    <li key={detail} className="line-clamp-2">
                      {i18n.tx(detail)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{i18n.t("Reyestr yozuvi nashr qilingan.")}</p>
              )}
              <p className="mt-4 text-xs text-slate-500">
                {record.periodStart
                  ? i18n.t("{p0}{p1}", {
                      p0: i18n.tx(formatDate(record.periodStart)),
                      p1: i18n.tx(record.periodEnd ? ` — ${formatDate(record.periodEnd)}` : ""),
                    })
                  : formatDate(record.publishedAt ?? record.updatedAt)}
              </p>
            </article>
          );
        })}
      </div>
      {!completed.length && !data.catalog.length ? (
        <EmptyState
          icon={BookOpen}
          title={i18n.t("Tasdiqlangan ilmiy ish hali yo‘q")}
          text="Olti bosqichdan o‘tib tasdiqlangan loyiha yoki nashr qilingan reyestr yozuvi shu yerda paydo bo‘ladi."
        />
      ) : null}
    </div>
  );
}

export function ProjectsView({
  data,
  openProject,
  createProject,
}: {
  data: Dashboard;
  openProject: (project: Project) => void;
  createProject: () => void;
}) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = data.projects.filter((project) => {
    const matchesQuery =
      !query ||
      normalize(`${project.code} ${project.title} ${project.organization} ${project.leader} ${project.area}`).includes(
        normalize(query),
      );
    const matchesStatus =
      status === "all" ||
      project.status === status ||
      (status === "review" && ["institute_review", "committee_review"].includes(project.status));
    return matchesQuery && matchesStatus;
  });

  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardHeader className="border-b py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{i18n.t("Ilmiy loyihalar reyestri")}</CardTitle>
            <CardDescription className="mt-1">
              {i18n.t("Qoralamadan joriy etishgacha bo‘lgan yagona nazorat jadvali")}
            </CardDescription>
          </div>
          {data.capabilities.createProject ? (
            <Button onClick={createProject}>
              <Plus />
              {i18n.t("Yangi loyiha")}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label={i18n.t("Ilmiy loyihalarni qidirish")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={i18n.t("Kod, loyiha, tashkilot yoki rahbar...")}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label={i18n.t("Loyiha holati bo‘yicha filtrlash")} className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.t("Barcha holatlar")}</SelectItem>
              <SelectItem value="draft">{i18n.t("Qoralama")}</SelectItem>
              <SelectItem value="active">{i18n.t("Jarayonda")}</SelectItem>
              <SelectItem value="returned">{i18n.t("Qaytarilgan")}</SelectItem>
              <SelectItem value="review">{i18n.t("Tekshiruvda")}</SelectItem>
              <SelectItem value="completed">{i18n.t("Yakunlangan")}</SelectItem>
              <SelectItem value="implementation">{i18n.t("Joriy etishda")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">{i18n.t("Loyiha")}</TableHead>
                <TableHead>{i18n.t("Ijrochi")}</TableHead>
                <TableHead>{i18n.t("Holat")}</TableHead>
                <TableHead>{i18n.t("Progress")}</TableHead>
                <TableHead>{i18n.t("Muddat")}</TableHead>
                <TableHead className="pr-6 text-right">{i18n.t("Amal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => {
                const deadline = deadlineLabel(project);
                return (
                  <TableRow key={project.id}>
                    <TableCell className="max-w-[360px] whitespace-normal pl-6">
                      <p className="text-xs font-semibold text-[#0a4c8c]">
                        {project.code} · {i18n.tx(project.area)}
                      </p>
                      <p className="mt-1 font-semibold leading-5">{i18n.tx(project.title)}</p>
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal">
                      <p className="text-sm">{i18n.tx(project.organization)}</p>
                      <p className="mt-1 text-xs text-slate-500">{i18n.tx(project.leader)}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="min-w-36">
                      <div className="flex items-center gap-2">
                        <Progress
                          aria-label={i18n.t("{title} progressi", { title: i18n.tx(project.title) })}
                          value={project.progress}
                        />
                        <span className="text-xs font-semibold">{project.progress}%</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {project.stage}
                        {i18n.t("/6-bosqich")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(project.endDate)}</p>
                      {deadline ? (
                        <p
                          className={`mt-1 text-xs font-semibold ${deadline.tone === "danger" ? "text-rose-700" : "text-amber-700"}`}
                        >
                          {i18n.t(deadline.label, { days: deadline.days })}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button size="sm" variant="outline" onClick={() => openProject(project)}>
                        {i18n.t("Ochish")}
                        <ChevronRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title={i18n.t("Loyiha topilmadi")}
              text="Qidiruv yoki holat filtrini o‘zgartiring."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProblemsView({ data, onOpen }: { data: Dashboard; onOpen: (modal: ModalState) => void }) {
  const i18n = useI18n();
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{i18n.t("Sohadagi amaliy muammolar")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {i18n.t("Hudud va tashkilotlardan kelgan muammolar uchun ilmiy yechimlar tanlovi")}
          </p>
        </div>
        {data.capabilities.manageIntake ? (
          <Button onClick={() => onOpen({ type: "problemForm" })}>
            <Plus />
            {i18n.t("Muammo e’lon qilish")}
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {data.problems.map((problem) => (
          <Card key={problem.id} className="gap-4 border-0 py-5 shadow-sm">
            <CardHeader className="px-5 pb-0">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="text-[#0a4c8c]">
                  {problem.code}
                </Badge>
                <StatusBadge status={problem.status} />
              </div>
              <CardTitle className="mt-3 text-base leading-6">{i18n.tx(problem.title)}</CardTitle>
              <CardDescription>{i18n.tx(problem.sourceOrganization)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5">
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{i18n.tx(problem.description)}</p>
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="text-slate-500">{i18n.t("Arizalar")}</p>
                  <p className="mt-1 font-bold text-slate-800">
                    {Number(problem.proposalCount)} {i18n.t("ta")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">{i18n.t("Muddat")}</p>
                  <p className="mt-1 font-bold text-slate-800">{formatDate(problem.deadline)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onOpen({ type: "problem", problem })}>
                  {i18n.t("Batafsil")}
                </Button>
                {data.capabilities.submitProposal && ["open", "submitted"].includes(problem.status) ? (
                  <Button size="sm" onClick={() => onOpen({ type: "proposal", problem })}>
                    {i18n.t("Yechim yuborish")}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
        {!data.problems.length ? (
          <div className="lg:col-span-3">
            <EmptyState
              icon={AlertTriangle}
              title={i18n.t("Amaliy muammo yo‘q")}
              text="Yangi muammolar e’lon qilinganda shu yerda ko‘rinadi."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TopicsView({ data, onOpen }: { data: Dashboard; onOpen: (modal: ModalState) => void }) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const topics = data.topics.filter(
    (topic) => !query || normalize(`${topic.title} ${topic.area} ${topic.rationale}`).includes(normalize(query)),
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold">{i18n.t("Tavsiya etiladigan mavzular banki")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {i18n.t("Amaliy ehtiyoj asosida loyiha pasportiga aylantiriladigan mavzular")}
          </p>
        </div>
        {data.capabilities.manageIntake ? (
          <Button onClick={() => onOpen({ type: "topicForm" })}>
            <Plus />
            {i18n.t("Mavzu qo‘shish")}
          </Button>
        ) : null}
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label={i18n.t("Tavsiya mavzularini qidirish")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={i18n.t("Mavzu yoki yo‘nalish bo‘yicha qidirish...")}
          className="bg-white pl-9"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="gap-4 py-5 shadow-sm">
            <CardHeader className="px-5 pb-0">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                  {i18n.tx(topic.area)}
                </Badge>
                <StatusBadge status={topic.status} />
              </div>
              <CardTitle className="mt-3 text-base leading-6">{i18n.tx(topic.title)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5">
              <p className="text-sm leading-6 text-slate-600">{i18n.tx(topic.rationale)}</p>
              <p className="text-xs text-slate-500">
                <b>{i18n.t("Manba:")}</b> {i18n.tx(topic.sourceOrganization)}
              </p>
              {data.capabilities.selectIntake && topic.status === "open" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onOpen({
                      type: "projectForm",
                      prefill: {
                        title: topic.title,
                        area: topic.area,
                        problem: topic.rationale,
                        objective: "Mavzu bo‘yicha amaliy ilmiy yechim ishlab chiqish.",
                        expectedResult: "O‘lchanadigan ilmiy natija va amaliy joriy etish tavsiyasi.",
                        origin: "topic",
                        sourceIntakeId: topic.id,
                      },
                    })
                  }
                >
                  <ArrowRight />
                  {i18n.t("Loyihaga aylantirish")}
                </Button>
              ) : null}
              {topic.selectedProjectId ? (
                <Button size="sm" variant="outline" disabled>
                  {i18n.t("Loyiha #")}
                  {topic.selectedProjectId} {i18n.t("yaratildi")}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {!topics.length ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              icon={Lightbulb}
              title={i18n.t("Tavsiya mavzu topilmadi")}
              text="Yangi mavzu qo‘shing yoki qidiruv so‘rovini o‘zgartiring."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ForeignView({ data, onOpen }: { data: Dashboard; onOpen: (modal: ModalState) => void }) {
  const i18n = useI18n();
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{i18n.t("Xorijiy innovatsiyalar")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {i18n.t("O‘zbekiston sharoitiga moslashtirish va pilotdan o‘tkazish uchun yechimlar")}
          </p>
        </div>
        {data.capabilities.manageIntake ? (
          <Button onClick={() => onOpen({ type: "foreignForm" })}>
            <Plus />
            {i18n.t("Xorijiy loyiha")}
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {data.foreignProjects.map((item) => (
          <Card key={item.id} className="gap-4 overflow-hidden border-0 py-0 shadow-sm">
            <div className="bg-gradient-to-r from-[#0a3158] to-[#116a72] p-5 text-white">
              <div className="flex items-center justify-between">
                <Badge className="bg-white/15 text-white">{i18n.tx(item.country)}</Badge>
                <span className="text-2xl font-bold">{item.readiness}%</span>
              </div>
              <h3 className="mt-5 text-lg font-bold leading-6">{i18n.tx(item.title)}</h3>
              <p className="mt-1 text-xs text-teal-100">{i18n.t("Mahalliylashtirish tayyorgarligi")}</p>
            </div>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold text-slate-500">{i18n.t("Asosiy samara")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{i18n.tx(item.impact)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">{i18n.t("Mahalliylashtirish")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{i18n.tx(item.adaptation)}</p>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={item.status} />
                {data.capabilities.selectIntake &&
                ["open", "submitted"].includes(item.status) &&
                !item.pilotProjectId ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      onOpen({
                        type: "projectForm",
                        prefill: {
                          title: item.title,
                          area: item.area,
                          problem: `${item.country} tajribasini mahalliy sharoitga moslashtirish zarur.`,
                          objective: item.adaptation,
                          expectedResult: item.impact,
                          origin: "foreign",
                          sourceIntakeId: item.id,
                          kind: "pilot",
                        },
                      })
                    }
                  >
                    <Target />
                    {i18n.t("Pilot yaratish")}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
        {!data.foreignProjects.length ? (
          <div className="lg:col-span-3">
            <EmptyState
              icon={Globe2}
              title={i18n.t("Xorijiy loyiha yo‘q")}
              text="O‘rganiladigan innovatsion yechimlar shu yerda jamlanadi."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function smartSearch(data: Dashboard, query: string): SearchResult[] {
  const phrase = normalize(query);
  const tokens = Array.from(new Set(phrase.split(" ").filter((token) => token.length > 2)));
  if (!tokens.length) return [];
  const records = [
    ...data.projects.map((item) => ({
      id: `project-${item.id}`,
      type: "Ilmiy loyiha",
      title: item.title,
      subtitle: `${item.code} · ${item.organization}`,
      body: `${item.title} ${item.area} ${item.problem} ${item.objective} ${item.novelty} ${item.expectedResult} ${item.organization}`,
    })),
    ...data.problems.map((item) => ({
      id: `problem-${item.id}`,
      type: "Amaliy muammo",
      title: item.title,
      subtitle: `${item.code} · ${item.sourceOrganization}`,
      body: `${item.title} ${item.area} ${item.description} ${item.expectedResult}`,
    })),
    ...data.topics.map((item) => ({
      id: `topic-${item.id}`,
      type: "Tavsiya mavzu",
      title: item.title,
      subtitle: item.sourceOrganization,
      body: `${item.title} ${item.area} ${item.rationale}`,
    })),
    ...data.foreignProjects.map((item) => ({
      id: `foreign-${item.id}`,
      type: "Xorijiy loyiha",
      title: item.title,
      subtitle: `${item.country} · ${item.area}`,
      body: `${item.title} ${item.country} ${item.area} ${item.impact} ${item.adaptation}`,
    })),
    ...data.catalog.map((item) => ({
      id: `catalog-${item.id}`,
      type: "Rasmiy reyestr",
      title: item.title,
      subtitle: "Nashr qilingan ilmiy ish",
      body: `${item.title} ${Object.values(item.values).join(" ")}`,
    })),
  ];
  return records
    .map((record) => {
      const haystack = normalize(record.body);
      const matched = tokens.filter((token) => haystack.includes(token));
      const coverage = matched.length / tokens.length;
      const titleHits = tokens.filter((token) => normalize(record.title).includes(token)).length;
      const phraseBonus = phrase.length > 4 && haystack.includes(phrase) ? 20 : 0;
      const score = Math.min(100, Math.round(coverage * 70 + (titleHits / tokens.length) * 10 + phraseBonus));
      return { ...record, score, matched };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export function SearchView({ data }: { data: Dashboard }) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const results = useMemo(() => smartSearch(data, submitted), [data, submitted]);
  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(query);
  }
  return (
    <div className="space-y-5">
      <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm">
        <div className="bg-gradient-to-r from-[#0a3158] via-[#0a4c8c] to-[#0c6c72] p-6 text-white sm:p-8">
          <Badge className="bg-white/15 text-white">
            <Search />
            {i18n.t("Kengaytirilgan qidiruv")}
          </Badge>
          <h2 className="mt-4 text-2xl font-bold">{i18n.t("Ilmiy bilimlar bazasidan mos yechimni toping")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-100">
            {i18n.t(
              "Qidiruv loyiha, muammo, tavsiya mavzu va xorijiy tajribani birgalikda tekshiradi. Moslik so‘rovdagi aniq kalit signallar qamrovi asosida hisoblanadi.",
            )}
          </p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={i18n.t("Masalan: issiq iqlimda asfalt deformatsiyasini kamaytirish")}
              className="h-11 border-white/30 bg-white text-slate-900"
            />
            <Button type="submit" className="h-11 bg-emerald-600 hover:bg-emerald-700">
              <Search />
              {i18n.t("Izlash")}
            </Button>
          </form>
        </div>
      </Card>
      {submitted ? (
        results.length ? (
          <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{i18n.t("Topilgan natijalar")}</h3>
                <Badge variant="outline">
                  {results.length} {i18n.t("ta")}
                </Badge>
              </div>
              {results.map((item) => (
                <Card key={item.id} className="gap-3 py-4 shadow-sm">
                  <CardContent className="px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {i18n.tx(item.type)}
                        </Badge>
                        <h4 className="font-semibold leading-6">{i18n.tx(item.title)}</h4>
                        <p className="mt-1 text-xs text-slate-500">{i18n.tx(item.subtitle)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#0a4c8c]">{item.score}%</p>
                        <p className="text-[11px] text-slate-400">{i18n.t("moslik")}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      <b>{i18n.t("Mos kelgan signallar:")}</b> {i18n.tx(item.matched.join(", "))}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="h-fit gap-0 py-0 shadow-sm xl:sticky xl:top-24">
              <CardHeader className="border-b py-5">
                <CardTitle>{i18n.t("Solishtirish")}</CardTitle>
                <CardDescription>{i18n.t("Eng yuqori moslikdagi to‘rtta natija")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">{i18n.t("Natija")}</TableHead>
                      <TableHead>{i18n.t("Turi")}</TableHead>
                      <TableHead className="pr-5 text-right">{i18n.t("Moslik")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.slice(0, 4).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-56 whitespace-normal pl-5 font-medium">
                          {i18n.tx(item.title)}
                        </TableCell>
                        <TableCell className="whitespace-normal text-xs text-slate-500">{i18n.tx(item.type)}</TableCell>
                        <TableCell className="pr-5 text-right font-bold text-[#0a4c8c]">{item.score}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={i18n.t("Mos natija topilmadi")}
            text="Boshqa kalit so‘z yoki aniqroq muammo bilan qidiring."
          />
        )
      ) : (
        <EmptyState
          icon={BookOpen}
          title={i18n.t("Bilimlar bazasi tayyor")}
          text="Qidiruv so‘rovini kiriting. Natijalar nima sabab mos kelgani bilan ko‘rsatiladi."
        />
      )}
    </div>
  );
}
