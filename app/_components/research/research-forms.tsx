"use client";

import { useI18n } from "../../../lib/i18n";
import { FormEvent, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useNotify } from "../dashboard/dashboard-context";
import { readJson } from "@/lib/shared/http";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Project, Milestone, Dashboard, ProjectPrefill } from "./research-types";
import { AREA_OPTIONS, FieldLabel, SubmitButton } from "./research-ui";

export function ProjectForm({
  project,
  prefill,
  directory,
  onClose,
  onSaved,
}: {
  project?: Project;
  prefill?: ProjectPrefill;
  directory: Dashboard["directory"];
  onClose: () => void;
  onSaved: (payload: Record<string, unknown>) => Promise<unknown>;
}) {
  const i18n = useI18n();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(project);
  const initialOrganizationId = project?.executorOrganizationId ?? 0;
  const [organizationId, setOrganizationId] = useState(project ? String(initialOrganizationId) : "");
  const eligibleEmployees = directory.employees.filter(
    (employee) => employee.organizationId === Number(organizationId),
  );
  const [responsibleEmployeeId, setResponsibleEmployeeId] = useState(
    project ? String(project.responsibleEmployeeId) : "",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await onSaved({
        ...payload,
        action: editing ? "update_project" : "create_project",
        id: project?.id,
        version: project?.version,
        executorOrganizationId: Number(payload.executorOrganizationId || 0),
        responsibleEmployeeId: Number(payload.responsibleEmployeeId || 0),
        budget: Number(payload.budget || 0),
        origin: prefill?.origin ?? "manual",
        sourceIntakeId: prefill?.sourceIntakeId,
      });
      onClose();
    } catch (cause) {
      setMessage(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Ma’lumot saqlanmadi."));
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="research-dialog-content max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{editing ? i18n.t("Loyiha pasportini tahrirlash") : i18n.t("Yangi ilmiy loyiha")}</DialogTitle>
        <DialogDescription>
          {i18n.t(
            "Loyiha pasporti Qo‘mita mas’ul boshqarmasi tomonidan shakllantiriladi. Bosqichlar avtomatik yaratiladi.",
          )}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-title">{i18n.t("Loyiha nomi *")}</FieldLabel>
          <Input
            id="project-title"
            name="title"
            defaultValue={project?.title ?? prefill?.title}
            required
            maxLength={280}
          />
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="project-kind">{i18n.t("Loyiha turi *")}</FieldLabel>
          <Select name="kind" defaultValue={project?.kind ?? prefill?.kind ?? "research"}>
            <SelectTrigger id="project-kind" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="research">{i18n.t("Ilmiy tadqiqot")}</SelectItem>
              <SelectItem value="innovation">{i18n.t("Innovatsion texnologiya")}</SelectItem>
              <SelectItem value="pilot">{i18n.t("Pilot loyiha")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="project-area">{i18n.t("Yo‘nalish *")}</FieldLabel>
          <Select name="area" defaultValue={project?.area ?? prefill?.area ?? "Qoplama"}>
            <SelectTrigger id="project-area" className="w-full">
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
          <FieldLabel htmlFor="project-org">{i18n.t("Ijrochi tashkilot *")}</FieldLabel>
          <Select
            name="executorOrganizationId"
            value={organizationId}
            onValueChange={(value) => {
              setOrganizationId(value);
              setResponsibleEmployeeId("");
            }}
            required
          >
            <SelectTrigger id="project-org" className="w-full">
              <SelectValue placeholder={i18n.t("Tashkilotni tanlang")} />
            </SelectTrigger>
            <SelectContent>
              {directory.organizations.map((organization) => (
                <SelectItem key={organization.id} value={String(organization.id)}>
                  {i18n.tx(organization.shortName)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="project-leader">{i18n.t("Loyiha rahbari *")}</FieldLabel>
          <Select
            name="responsibleEmployeeId"
            value={responsibleEmployeeId}
            onValueChange={setResponsibleEmployeeId}
            disabled={!organizationId}
            required
          >
            <SelectTrigger id="project-leader" className="w-full">
              <SelectValue placeholder={i18n.t("Mas’ul xodimni tanlang")} />
            </SelectTrigger>
            <SelectContent>
              {eligibleEmployees.map((employee) => (
                <SelectItem key={employee.id} value={String(employee.id)}>
                  {i18n.tx(employee.name)}
                  {employee.position ? i18n.t(" · {position}", { position: i18n.tx(employee.position) }) : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!eligibleEmployees.length ? (
            <p className="text-xs text-amber-700">
              {i18n.t("Tanlangan tashkilot uchun faol loyiha rahbari biriktirilmagan.")}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-coordinator">{i18n.t("Mas’ul Qo‘mita boshqarmasi *")}</FieldLabel>
          <Input
            id="project-coordinator"
            value={directory.coordinator.name}
            disabled
            aria-describedby="project-coordinator-help"
          />
          <p id="project-coordinator-help" className="text-xs text-slate-500">
            {i18n.t("Rasmiy ma’lumot egasi katalogdan avtomatik olinadi.")}
          </p>
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="project-start">{i18n.t("Boshlanish sanasi *")}</FieldLabel>
          <Input id="project-start" name="startDate" type="date" defaultValue={project?.startDate} required />
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="project-end">{i18n.t("Tugash sanasi *")}</FieldLabel>
          <Input id="project-end" name="endDate" type="date" defaultValue={project?.endDate} required />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-budget">{i18n.t("Budjet, mln so‘m")}</FieldLabel>
          <Input id="project-budget" name="budget" type="number" min="0" step="1" defaultValue={project?.budget ?? 0} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-problem">{i18n.t("Yechiladigan muammo *")}</FieldLabel>
          <Textarea
            id="project-problem"
            name="problem"
            defaultValue={project?.problem ?? prefill?.problem}
            required
            className="min-h-20"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-objective">{i18n.t("Maqsad va asosiy vazifa *")}</FieldLabel>
          <Textarea
            id="project-objective"
            name="objective"
            defaultValue={project?.objective ?? prefill?.objective}
            required
            className="min-h-20"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-novelty">{i18n.t("Ilmiy yangilik")}</FieldLabel>
          <Textarea id="project-novelty" name="novelty" defaultValue={project?.novelty} className="min-h-20" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <FieldLabel htmlFor="project-result">{i18n.t("Kutilayotgan o‘lchanadigan natija *")}</FieldLabel>
          <Textarea
            id="project-result"
            name="expectedResult"
            defaultValue={project?.expectedResult ?? prefill?.expectedResult}
            required
            className="min-h-20"
          />
        </div>
        {message ? (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">
            {i18n.tx(message)}
          </p>
        ) : null}
        <DialogFooter className="sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {i18n.t("Bekor qilish")}
          </Button>
          <SubmitButton pending={pending} disabled={!eligibleEmployees.length}>
            {editing ? i18n.t("O‘zgarishlarni saqlash") : i18n.t("Qoralama yaratish")}
          </SubmitButton>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function SimpleActionForm({
  title,
  description,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (form: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  const i18n = useI18n();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      await onSubmit(new FormData(event.currentTarget));
      onClose();
    } catch (cause) {
      setMessage(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Amal bajarilmadi."));
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="research-dialog-content max-h-[92vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{i18n.tx(title)}</DialogTitle>
        <DialogDescription>{i18n.tx(description)}</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {children}
        {message ? (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">
            {i18n.tx(message)}
          </p>
        ) : null}
        <DialogFooter className="sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {i18n.t("Bekor qilish")}
          </Button>
          <SubmitButton pending={pending}>{i18n.t(submitLabel)}</SubmitButton>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function FileUploader({
  project,
  milestone,
  onUploaded,
}: {
  project: Project;
  milestone?: Milestone;
  onUploaded: () => Promise<void>;
}) {
  const i18n = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const notify = useNotify();

  if (!project.capabilities.upload) return null;

  async function upload() {
    if (!file) return notify(i18n.t("Avval faylni tanlang."), "error");
    setPending(true);
    const evidenceUpload = project.capabilities.contribute && milestone;
    const params = new URLSearchParams({
      projectId: String(project.id),
      purpose: evidenceUpload ? "evidence" : "passport",
    });
    if (evidenceUpload) params.set("milestoneId", String(milestone.id));
    try {
      const response = await fetch(`/api/information/research/files?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
          "X-File-Size": String(file.size),
        },
        body: file,
      });
      await readJson(response, "Fayl yuklanmadi.");
      notify(i18n.t("Fayl loyihaga biriktirildi."));
      setFile(null);
      setInputKey((value) => value + 1);
      await onUploaded();
    } catch (cause) {
      notify(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Fayl yuklanmadi."), "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          key={inputKey}
          type="file"
          accept=".pdf,.docx,.xlsx,.zip,.jpg,.jpeg,.png,.webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="bg-white"
          aria-label={i18n.t("Loyiha faylini tanlash")}
        />
        <Button type="button" variant="outline" disabled={!file || pending} onClick={upload}>
          {pending ? <Loader2 className="animate-spin" /> : <Upload />}
          {i18n.t("Yuklash")}
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-500">{i18n.t("PDF, DOCX, XLSX, ZIP yoki rasm — ko‘pi bilan 15 MB.")}</p>
    </div>
  );
}
