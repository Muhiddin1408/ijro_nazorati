"use client";

import { useI18n } from "../lib/i18n";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileSearch,
  FlaskConical,
  LoaderCircle,
  Search,
  Sparkles,
  TableProperties,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type {
  InformationOpenTarget,
  InformationSearchKind,
  InformationSearchResponse,
} from "../lib/information-search-types";
import { readJson } from "../lib/shared/http";

const labels = { all: "Barchasi", record: "Ma’lumotlar", template: "Jadval shakllari", research: "Ilmiy loyihalar" };
const statuses: Record<string, string> = {
  draft: "Qoralama",
  submitted: "Ko‘rib chiqilmoqda",
  published: "Tasdiqlangan",
  returned: "Qaytarilgan",
  archived: "Arxiv",
  active: "Jarayonda",
  institute_review: "Tashkilot tekshiruvida",
  committee_review: "Boshqarma tekshiruvida",
  completed: "Yakunlangan",
  implementation: "Joriy etilmoqda",
  catalog: "Jadval shakli",
};
const examples = ["Xorazmdagi xorijiy safarlar", "Xodimlarning oylik ish haqi", "Tasdiqlangan ilmiy tadqiqotlar"];

export function InformationSearch({ onOpen }: { onOpen: (target: InformationOpenTarget) => void }) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<InformationSearchKind>("all");
  const [published, setPublished] = useState(false);
  const [result, setResult] = useState<InformationSearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(
    () => () => {
      sequence.current += 1;
      request.current?.abort();
    },
    [],
  );

  async function search(text = query, selectedKind = kind, page = 0, answer = false) {
    if (text.trim().length < 2) {
      setError(i18n.t("Mavzu yoki savolingizni yozing."));
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const current = ++sequence.current;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/information/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          kind: selectedKind,
          page,
          status: published ? "published" : "all",
          answer,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      const next = await readJson<InformationSearchResponse>(response, "Qidiruv bajarilmadi");
      if (controller.signal.aborted || current !== sequence.current) return;
      setResult(next);
      setKind(next.kind);
    } catch (cause) {
      if (!controller.signal.aborted && current === sequence.current) {
        if (!answer) setResult(null);
        setError(cause instanceof Error ? i18n.tx(cause.message) : i18n.t("Qidiruv bajarilmadi"));
      }
    } finally {
      if (current === sequence.current) setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void search();
  }

  return (
    <section className="information-search-page">
      <header className="information-search-heading">
        <span>
          <Sparkles size={26} />
        </span>
        <div>
          <h1>{i18n.t("AI qidiruv")}</h1>
          <p>{i18n.t("Boshqarmalarni birma-bir ochmasdan ma’lumot yoki ilmiy loyihani toping.")}</p>
        </div>
      </header>
      <form className="information-search-form" onSubmit={submit}>
        <label htmlFor="information-question">{i18n.t("Qanday ma’lumot kerak?")}</label>
        <div className="information-search-input">
          <Search size={21} />
          <Input
            id="information-question"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={400}
            placeholder={i18n.t("Masalan: Xorazmdagi xorijiy safarlar haqida ma’lumot")}
            autoComplete="off"
          />
          <Button type="submit" disabled={query.trim().length < 2}>
            {busy ? <LoaderCircle className="spin" /> : <Search />}
            {i18n.t("Qidirish")}
          </Button>
        </div>
        <div className="information-search-options">
          <label>
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />{" "}
            {i18n.t("Faqat tasdiqlangan ma’lumotlar")}
          </label>
          <span>{i18n.t("Lotin va kirill yozuvida qidirish mumkin")}</span>
        </div>
      </form>
      {!result && !busy ? (
        <div className="information-search-examples">
          {examples.map((text) => (
            <Button
              key={text}
              variant="outline"
              onClick={() => {
                setQuery(text);
                void search(text, "all");
              }}
            >
              {i18n.tx(text)}
              <ArrowRight size={14} />
            </Button>
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="info-alert info-alert-error" role="alert">
          {i18n.tx(error)}
          <Button variant="outline" onClick={() => void search()}>
            {i18n.t("Qayta urinish")}
          </Button>
        </div>
      ) : null}
      {busy ? (
        <div className="information-search-loading" role="status">
          <LoaderCircle className="spin" size={20} />
          {i18n.t("Ma’lumotlar tekshirilmoqda…")}
          <Button
            variant="ghost"
            onClick={() => {
              request.current?.abort();
              sequence.current += 1;
              setBusy(false);
            }}
          >
            {i18n.t("Bekor qilish")}
          </Button>
        </div>
      ) : null}
      {result && !busy ? (
        <>
          <div className="information-search-filters" aria-label={i18n.t("Natija turi")}>
            {(Object.keys(labels) as InformationSearchKind[]).map((key) => (
              <Button
                key={key}
                variant={kind === key ? "default" : "outline"}
                aria-pressed={kind === key}
                onClick={() => void search(result.query, key)}
              >
                {i18n.tx(labels[key])}{" "}
                <span>
                  {key === "all" ? Object.values(result.counts).reduce((sum, n) => sum + n, 0) : result.counts[key]}
                </span>
              </Button>
            ))}
          </div>
          <div className="information-search-summary" role="status">
            <strong>
              “{i18n.tx(result.query)}” — {result.total} {i18n.t("ta natija")}
            </strong>
            <span>
              {result.status === "published" ? i18n.t("Faqat tasdiqlangan") : i18n.t("Barcha holatlar")}{" "}
              {i18n.t("· Manbalar bo‘yicha qidiruv")}
            </span>
          </div>
          {result.aiStatus === "ready" && result.results.length ? (
            <div>
              <Button variant="outline" onClick={() => void search(result.query, kind, result.page, true)}>
                <Sparkles />
                {i18n.t("Shu manbalar asosida AI javobi")}
              </Button>
              <p className="information-search-note">
                {i18n.t("Bu tugma bosilganda savol va ruxsatli manba parchalari OpenAI xizmatiga yuboriladi.")}
              </p>
            </div>
          ) : null}
          {result.answer ? (
            <article className="information-ai-answer">
              <h2>
                <Sparkles size={18} />
                {i18n.t("AI javobi")}
              </h2>
              <p>{i18n.tx(result.answer.text)}</p>
              <div>
                {result.answer.sourceKeys.map((key) => {
                  const item = result.results.find((row) => row.key === key);
                  return item ? (
                    <button key={key} onClick={() => onOpen(item.target)}>
                      {i18n.tx(item.title)}
                      <ArrowRight size={14} />
                    </button>
                  ) : null;
                })}
              </div>
            </article>
          ) : null}
          {result.aiStatus === "unavailable" ? (
            <p className="information-search-note">
              {i18n.t("AI javobi hozir olinmadi. Quyidagi manbalarni ochib ko‘rishingiz mumkin.")}
            </p>
          ) : result.aiStatus === "no_sources" ? (
            <p className="information-search-note">
              {i18n.t("Bu natijalardan matnli AI javobi tayyorlanmaydi. Mavjud manbalarni quyida ochishingiz mumkin.")}
            </p>
          ) : result.aiStatus === "not_configured" ? (
            <p className="information-search-note">
              {i18n.t("Manbalarni qidirish ishlayapti. Matnli AI javobi uchun AI xizmati hali ulanmagan.")}
            </p>
          ) : null}
          {!result.results.length ? (
            <div className="info-empty">
              <FileSearch size={30} />
              <strong>{i18n.t("Mos ma’lumot topilmadi")}</strong>
              <p>
                {i18n.t(
                  "Mavzu yoki hudud nomini aniqroq yozing. Tizimga kiritilmagan yoki vakolatingizdan tashqaridagi ma’lumotlar ko‘rsatilmaydi.",
                )}
              </p>
            </div>
          ) : (
            <div className="information-search-results">
              {result.results.map((item) => {
                const Icon =
                  item.target.kind === "research"
                    ? FlaskConical
                    : item.target.kind === "template"
                      ? TableProperties
                      : FileSearch;
                return (
                  <article key={item.key}>
                    <div className="information-result-top">
                      <span>
                        <Icon size={17} />
                        {i18n.tx(labels[item.target.kind])}
                      </span>
                      <span className={`information-result-status status-${item.status}`}>
                        {i18n.t(statuses[item.status]) ?? i18n.tx(item.status)}
                      </span>
                    </div>
                    <h2>
                      <button onClick={() => onOpen(item.target)}>{i18n.tx(item.title)}</button>
                    </h2>
                    <p className="information-result-path">
                      {i18n.tx(item.domain)} → {i18n.tx(item.template)}
                    </p>
                    {item.organization ? (
                      <p className="information-result-organization">{i18n.tx(item.organization)}</p>
                    ) : null}
                    <p className="information-result-excerpt">
                      {i18n.tx(item.excerpt) ||
                        (item.target.kind === "template"
                          ? i18n.t("Ma’lumot shaklini ochib, mavjud yozuvlar va ustunlarni ko‘ring.")
                          : i18n.t("Batafsil ma’lumot manba kartochkasida."))}
                    </p>
                    <footer>
                      <small>
                        {item.updatedAt
                          ? i18n.t("Yangilandi: {p0}", {
                              p0: i18n.tx(
                                new Intl.DateTimeFormat("uz-UZ", {
                                  timeZone: "Asia/Tashkent",
                                  dateStyle: "medium",
                                }).format(
                                  new Date(
                                    item.updatedAt.replace(" ", "T") +
                                      (/Z|[+]\d\d:\d\d$/.test(item.updatedAt) ? "" : "Z"),
                                  ),
                                ),
                              ),
                            })
                          : i18n.t("Yozuv emas, jadval shakli")}
                      </small>
                      <Button variant="outline" onClick={() => onOpen(item.target)}>
                        {i18n.t("Manbani ochish")}
                        <ArrowRight size={15} />
                      </Button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
          {result.total > result.pageSize ? (
            <div className="information-search-pagination">
              <Button
                variant="outline"
                disabled={!result.page}
                onClick={() => void search(result.query, kind, result.page - 1)}
              >
                <ArrowLeft />
                {i18n.t("Oldingi")}
              </Button>
              <span>
                {result.page * result.pageSize + 1}–{Math.min((result.page + 1) * result.pageSize, result.total)} /{" "}
                {result.total}
              </span>
              <Button
                variant="outline"
                disabled={!result.hasMore}
                onClick={() => void search(result.query, kind, result.page + 1)}
              >
                {i18n.t("Keyingi")}
                <ArrowRight />
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
