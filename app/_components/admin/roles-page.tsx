"use client";

import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoadLoader } from "../../road-loader";
import { OrganizationCascadePicker, PageIntro, defaultDirectoryOrganizationId, readJson } from "../../dashboard-kit";
import { searchMatches } from "../../ui-helpers";
import type {
  AdminOrganization,
  AdminEmployee,
  AdminRole,
  AccessProfile,
  AccessProfilesPayload,
  InformationAccessGrant,
  InformationAccessPayload,
} from "./admin-types";
import { scopeLabel, organizationTypeLabel } from "./admin-helpers";
import { confirmDialog } from "../ui/confirm-dialog";
import { useI18n } from "../../../lib/i18n";

export function InformationAccessManager({ organizations }: { organizations: AdminOrganization[] }) {
  const { t, tx } = useI18n();
  const [organizationId, setOrganizationId] = useState(() => defaultDirectoryOrganizationId(organizations));
  const [principalType, setPrincipalType] = useState<"employee" | "staff_position">("employee");
  const [query, setQuery] = useState("");
  const [domainQuery, setDomainQuery] = useState("");
  const [principalId, setPrincipalId] = useState("");
  const [domainId, setDomainId] = useState("");
  const [memberRole, setMemberRole] = useState<"editor" | "reviewer">("editor");
  const [payload, setPayload] = useState<InformationAccessPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestSequence = useRef(0);

  const loadAccess = useCallback(
    async (cursor?: number, append = false) => {
      const sequence = ++requestSequence.current;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ principalType, limit: "100" });
        if (organizationId !== "all") params.set("organizationId", organizationId);
        if (query.trim()) params.set("q", query.trim());
        if (cursor != null) params.set("cursor", String(cursor));
        const next = await readJson<InformationAccessPayload>(
          await fetch(`/api/admin/information-access?${params}`, { cache: "no-store" }),
        );
        if (sequence !== requestSequence.current) return;
        setPayload((current) => {
          if (!append || !current) return next;
          const principals = new Map(
            current.principals.map((item) => [`${item.principalType}:${item.principalId}`, item]),
          );
          for (const item of next.principals) principals.set(`${item.principalType}:${item.principalId}`, item);
          const grants = new Map(current.grants.map((item) => [item.id, item]));
          for (const item of next.grants) grants.set(item.id, item);
          return {
            domains: next.domains,
            principals: [...principals.values()],
            grants: [...grants.values()],
            nextCursor: next.nextCursor,
          };
        });
      } catch (failure) {
        if (sequence === requestSequence.current)
          setError(failure instanceof Error ? failure.message : "Tematik vakolatlar yuklanmadi");
      } finally {
        if (sequence === requestSequence.current) setLoading(false);
      }
    },
    [organizationId, principalType, query],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAccess(), query.trim() ? 260 : 0);
    return () => {
      window.clearTimeout(timer);
      requestSequence.current += 1;
    };
  }, [loadAccess, query]);

  const filteredDomains = useMemo(
    () => (payload?.domains ?? []).filter((domain) => searchMatches(domainQuery, [domain.name, domain.code])),
    [domainQuery, payload?.domains],
  );
  const principalByKey = useMemo(
    () =>
      new Map(
        (payload?.principals ?? []).map((principal) => [
          `${principal.principalType}:${principal.principalId}`,
          principal,
        ]),
      ),
    [payload?.principals],
  );

  async function assign() {
    if (!principalId || !domainId) return;
    try {
      setSaving(true);
      setError("");
      setNotice("");
      const result = await readJson<{ created: boolean }>(
        await fetch("/api/admin/information-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            principalType,
            principalId: Number(principalId),
            domainId: Number(domainId),
            memberRole,
          }),
        }),
      );
      setNotice(result.created ? "Tematik vakolat biriktirildi" : "Tematik vakolat yangilandi");
      await loadAccess();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Vakolatni saqlab bo‘lmadi");
    } finally {
      setSaving(false);
    }
  }

  async function revoke(grant: InformationAccessGrant) {
    const principal = principalByKey.get(`${grant.principalType}:${grant.principalId}`);
    if (
      !(await confirmDialog({
        title: t("Vakolatni bekor qilish"),
        message: t("{name} uchun “{domain}” vakolatini bekor qilasizmi?", {
          name: principal ? tx(principal.name) : t("Tanlangan subyekt"),
          domain: tx(grant.domainName),
        }),
        confirmLabel: t("Bekor qilish"),
        cancelLabel: t("Orqaga"),
        tone: "danger",
      }))
    )
      return;
    try {
      setSaving(true);
      setError("");
      setNotice("");
      await readJson(
        await fetch("/api/admin/information-access", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grantId: grant.id }),
        }),
      );
      setNotice("Tematik vakolat bekor qilindi");
      await loadAccess();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Vakolatni bekor qilib bo‘lmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="panel thematic-access-panel">
      <header>
        <div>
          <p className="section-kicker">{t("TEMATIK VAKOLATLAR")}</p>
          <h2>{t("Yo‘nalish bo‘yicha kirituvchi va tekshiruvchilar")}</h2>
          <span>
            {t("Tashkilot faqat qidiruv doirasini belgilaydi; vakolat aniq xodim yoki shtat lavozimiga beriladi.")}
          </span>
        </div>
        <span className="connection-badge connected">
          <ShieldCheck size={14} /> {t("Aniq biriktirish")}
        </span>
      </header>
      <div className="thematic-access-controls">
        <OrganizationCascadePicker
          organizations={organizations}
          value={organizationId}
          onChange={(next) => {
            setOrganizationId(next);
            setPrincipalId("");
            setNotice("");
          }}
          ariaLabel={t("Tematik vakolat tashkiloti")}
        />
        <label>
          <span>{t("Vakolat egasi")}</span>
          <select
            value={principalType}
            onChange={(event) => {
              setPrincipalType(event.target.value as "employee" | "staff_position");
              setPrincipalId("");
              setNotice("");
            }}
          >
            <option value="employee">{t("Xodim")}</option>
            <option value="staff_position">{t("Shtat lavozimi")}</option>
          </select>
        </label>
        <label className="thematic-access-search">
          <span>{t("Qidirish")}</span>
          <span>
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPrincipalId("");
                setNotice("");
              }}
              placeholder={principalType === "employee" ? t("F.I.Sh. yoki lavozim") : t("Lavozim yoki bo‘lim")}
            />
          </span>
        </label>
      </div>
      <div className="thematic-access-form">
        <label>
          <span>{principalType === "employee" ? t("Xodim") : t("Shtat lavozimi")}</span>
          <select value={principalId} onChange={(event) => setPrincipalId(event.target.value)} disabled={loading}>
            <option value="">{t("Tanlang")}</option>
            {(payload?.principals ?? []).map((principal) => (
              <option key={`${principal.principalType}:${principal.principalId}`} value={principal.principalId}>
                {tx(principal.name)}
                {principal.position && principal.position !== principal.name ? ` — ${tx(principal.position)}` : ""}
                {principal.provisional
                  ? ` · ${t("vaqtinchalik")}`
                  : !principal.occupied && principalType === "staff_position"
                    ? ` · ${t("vakant")}`
                    : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="thematic-domain-select">
          <span>{t("Ma’lumot yo‘nalishi")}</span>
          <span className="thematic-domain-search">
            <Search size={14} />
            <input
              value={domainQuery}
              onChange={(event) => setDomainQuery(event.target.value)}
              placeholder={t("Yo‘nalishni qidiring")}
            />
          </span>
          <select value={domainId} onChange={(event) => setDomainId(event.target.value)}>
            <option value="">{t("Yo‘nalishni tanlang")}</option>
            {filteredDomains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {tx(domain.name)}
                {domain.visibility === "restricted" ? ` · ${t("cheklangan")}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t("Amal")}</span>
          <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as "editor" | "reviewer")}>
            <option value="editor">{t("Ma’lumot kiritadi")}</option>
            <option value="reviewer">{t("Yo‘nalish bo‘yicha tekshiradi")}</option>
          </select>
        </label>
        <button
          className="primary-button"
          disabled={saving || loading || !principalId || !domainId}
          onClick={() => void assign()}
        >
          {saving ? <RefreshCw className="spin" size={16} /> : <Plus size={16} />} {t("Biriktirish")}
        </button>
      </div>
      <div className="thematic-access-safety">
        <LockKeyhole size={16} />
        <span>
          <strong>{t("Umumiy vakolat berilmaydi.")}</strong>{" "}
          {t("Har bir yo‘nalish va mas’ul alohida tanlanadi; bekor qilish audit jurnalida saqlanadi.")}
        </span>
      </div>
      {error ? (
        <div className="warning-note thematic-access-message" role="alert">
          <CircleAlert size={16} />
          <span>{t(error)}</span>
          <button className="secondary-button compact-button" onClick={() => void loadAccess()}>
            {t("Qayta urinish")}
          </button>
        </div>
      ) : null}
      {notice ? (
        <div className="success-note thematic-access-message" role="status">
          <CheckCircle2 size={16} />
          <span>{t(notice)}</span>
        </div>
      ) : null}
      {loading && payload == null ? (
        <RoadLoader
          compact
          label={t("Tematik vakolatlar yuklanmoqda")}
          detail={t("Tashkilot, lavozim va yo‘nalish bog‘lanishlari tekshirilmoqda…")}
        />
      ) : (
        <div className="thematic-grant-list">
          <div className="thematic-grant-heading">
            <strong>{t("Amaldagi biriktirishlar")}</strong>
            <span>{t("{n} ta", { n: payload?.grants.filter((grant) => grant.active).length ?? 0 })}</span>
          </div>
          {(payload?.grants ?? [])
            .filter((grant) => grant.active)
            .map((grant) => {
              const principal = principalByKey.get(`${grant.principalType}:${grant.principalId}`);
              return (
                <div className="thematic-grant-row" key={grant.id}>
                  <span className="metric-icon blue">
                    {grant.principalType === "employee" ? <UserCog size={17} /> : <Users size={17} />}
                  </span>
                  <div>
                    <strong>
                      {principal
                        ? tx(principal.name)
                        : `${grant.principalType === "employee" ? t("Xodim") : t("Shtat")} #${grant.principalId}`}
                    </strong>
                    <small>
                      {principal
                        ? [principal.organization, principal.department, principal.position]
                            .filter(Boolean)
                            .map((value) => tx(value))
                            .join(" · ")
                        : t("Subyekt ma’lumoti joriy filtrdan tashqarida")}
                    </small>
                  </div>
                  <div>
                    <strong>{tx(grant.domainName)}</strong>
                    <small>
                      {grant.memberRole === "editor" ? t("Ma’lumot kirituvchi") : t("Yo‘nalish tekshiruvchisi")} ·{" "}
                      {grant.grantSource}
                    </small>
                  </div>
                  <button
                    className="icon-button danger-icon"
                    disabled={saving}
                    onClick={() => void revoke(grant)}
                    aria-label={t("{domain} vakolatini bekor qilish", { domain: tx(grant.domainName) })}
                    title={t("Vakolatni bekor qilish")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          {payload && !payload.grants.some((grant) => grant.active) ? (
            <div className="empty-state">
              <ShieldCheck size={24} />
              <strong>{t("Bu kesimda tematik vakolat yo‘q")}</strong>
              <span>{t("Xodim yoki shtat lavozimini va tegishli yo‘nalishni tanlab biriktiring.")}</span>
            </div>
          ) : null}
          {payload?.nextCursor != null ? (
            <button
              className="wide-secondary thematic-load-more"
              disabled={loading}
              onClick={() => void loadAccess(payload.nextCursor ?? undefined, true)}
            >
              {loading ? <RefreshCw className="spin" size={15} /> : <ChevronRight size={15} />}{" "}
              {t("Keyingi natijalarni yuklash")}
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function RolesPage({
  roles,
  employees,
  organizations,
  canManageRoles,
  onAdd,
  onEdit,
}: {
  roles: AdminRole[];
  employees: AdminEmployee[];
  organizations: AdminOrganization[];
  canManageRoles: boolean;
  onAdd: () => void;
  onEdit: (role: AdminRole) => void;
}) {
  const { t, tx } = useI18n();
  const [accessProfiles, setAccessProfiles] = useState<AccessProfile[] | null>(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/access-profiles", { cache: "no-store", signal: controller.signal })
      .then((response) => readJson<AccessProfilesPayload>(response))
      .then((payload) => {
        setAccessProfiles(payload.profiles);
        setProfileError("");
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setAccessProfiles([]);
          setProfileError(failure instanceof Error ? failure.message : "Kirish profillari yuklanmadi");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ADMINISTRATOR")}
        title={t("Rollar va vakolatlar")}
        description={t(
          "Yangi rol oching va uning ma’lumot ko‘rish, topshiriq berish hamda boshqaruv vakolatlarini belgilang.",
        )}
        actions={
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> {t("Yangi rol")}
          </button>
        }
      />
      <div className="role-grid">
        {roles.map((role) => (
          <article className={`panel role-card ${!role.active ? "inactive-card" : ""}`} key={role.id}>
            <div className="role-card-head">
              <span className={`role-symbol ${role.code === "admin" ? "admin" : ""}`}>
                <ShieldCheck size={21} />
              </span>
              <div>
                <h3>{tx(role.name)}</h3>
                <span>
                  <span data-alphabet-static="true">{role.code}</span> ·{" "}
                  {t("{n} xodim", {
                    n: employees.filter((employee) => employee.roleId === role.id && employee.active).length,
                  })}
                </span>
              </div>
              {role.isSystem ? <em>{t("Tizim roli")}</em> : null}
            </div>
            <div className="permission-tags">
              <span>
                {t("Ko‘rish")}: {t(scopeLabel(role.permissions.viewScope))}
              </span>
              <span>
                {t("Topshirish")}: {t(scopeLabel(role.permissions.assignScope))}
              </span>
              {role.permissions.canManageOrganization ? <span>{t("Xodimlar")}</span> : null}
              {role.permissions.canManageRoles ? <span>{t("Rollar")}</span> : null}
              {role.permissions.canConfigure ? <span>{t("Integratsiya")}</span> : null}
              {role.permissions.canEnterInformation ? <span>{t("Ma’lumot kiritadi")}</span> : null}
              {role.permissions.canVerifyInformation ? <span>{t("Tekshiradi")}</span> : null}
              {role.permissions.canApproveInformation ? <span>{t("Tasdiqlaydi")}</span> : null}
            </div>
            <button className="wide-secondary" disabled={role.code === "admin"} onClick={() => onEdit(role)}>
              <SlidersHorizontal size={16} /> {t("Vakolatlarni tahrirlash")}
            </button>
          </article>
        ))}
      </div>
      {canManageRoles ? <InformationAccessManager organizations={organizations} /> : null}
      <article className="panel approval-flow-panel">
        <header>
          <div>
            <p className="section-kicker">{t("TASDIQLASH ZANJIRI")}</p>
            <h2>{t("Ma’lumotning tuman korxonasidan rahbariyatgacha yo‘li")}</h2>
          </div>
          <span className="connection-badge connected">
            <ShieldCheck size={14} /> {t("Serverda nazorat qilinadi")}
          </span>
        </header>
        <div className="approval-flow-steps">
          <div>
            <span>01</span>
            <strong>{t("Tuman korxonasi")}</strong>
            <small>{t("Kiritadi va yuboradi")}</small>
          </div>
          <ChevronRight size={18} />
          <div>
            <span>02</span>
            <strong>{t("Tuman/tashkilot rahbari")}</strong>
            <small>{t("Tashkilot nomidan tasdiqlaydi")}</small>
          </div>
          <ChevronRight size={18} />
          <div>
            <span>03</span>
            <strong>{t("Hududiy tegishli bo‘lim")}</strong>
            <small>{t("Yo‘nalish bo‘yicha tasdiqlaydi")}</small>
          </div>
          <ChevronRight size={18} />
          <div>
            <span>04</span>
            <strong>{t("Qo‘mita mas’ul boshqarmasi")}</strong>
            <small>{t("Yakuniy sohaviy tasdiq beradi")}</small>
          </div>
          <ChevronRight size={18} />
          <div>
            <span>05</span>
            <strong>{t("Qo‘mita rahbariyati")}</strong>
            <small>{t("Ko‘radi va nazorat qiladi")}</small>
          </div>
        </div>
        <div className="central-entry-note">
          <Database size={17} />
          <span>
            <strong>{t("Markazda shakllanadigan ma’lumotlar:")}</strong>{" "}
            {t(
              "ilmiy ishlar, axborot tizimlari va loyihaviy yechimlar tegishli boshqarma tomonidan bevosita kiritiladi.",
            )}
          </span>
        </div>
      </article>
      <article className="panel role-capability-panel">
        <header>
          <div>
            <p className="section-kicker">{t("KIRISH PROFILLARI")}</p>
            <h2>{t("Kim nimani ko‘radi va qaysi amalni bajaradi")}</h2>
          </div>
          <span>{t("{n} ta profil", { n: accessProfiles?.length ?? 0 })}</span>
        </header>
        {profileError ? (
          <div className="warning-note">
            <CircleAlert size={16} />
            <span>{t(profileError)}</span>
          </div>
        ) : null}
        {accessProfiles == null ? (
          <RoadLoader
            compact
            label={t("Vakolatlar tekshirilmoqda")}
            detail={t("Tashkilot darajasi va tasdiqlash huquqlari yuklanmoqda…")}
          />
        ) : (
          <div className="table-wrap">
            <table className="role-capability-table">
              <thead>
                <tr>
                  <th>{t("Kirish profili")}</th>
                  <th>{t("Tashkilot darajasi")}</th>
                  <th>{t("Ko‘rish")}</th>
                  <th>{t("Ma’lumot doirasi")}</th>
                  <th>{t("Kiritish")}</th>
                  <th>{t("Yuborish")}</th>
                  <th>{t("Tekshirish")}</th>
                  <th>{t("Tasdiqlash")}</th>
                  <th>{t("Barcha ma’lumot")}</th>
                </tr>
              </thead>
              <tbody>
                {accessProfiles.map((profile) => (
                  <tr key={profile.code}>
                    <td>
                      <strong>{tx(profile.name)}</strong>
                      <small data-alphabet-static="true">{profile.code}</small>
                    </td>
                    <td>{t(organizationTypeLabel(profile.organizationType))}</td>
                    <td>{t(scopeLabel(profile.viewScope))}</td>
                    <td>{t(scopeLabel(profile.informationScope))}</td>
                    {[
                      profile.canEnter,
                      profile.canSubmit,
                      profile.canVerify,
                      profile.canApprove,
                      profile.canViewAll,
                    ].map((allowed, index) => (
                      <td key={`${profile.code}-${index}`}>
                        <span className={`capability-state ${allowed ? "allowed" : "denied"}`}>
                          {allowed ? <Check size={13} /> : <X size={13} />}
                          {allowed ? t("Ha") : t("Yo‘q")}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!accessProfiles.length && !profileError ? (
              <div className="empty-state">
                <ShieldCheck size={24} />
                <strong>{t("Kirish profillari hali shakllanmagan")}</strong>
                <span>{t("Rol va tashkilot darajasiga mos profillar serverda yaratilgach shu yerda ko‘rinadi.")}</span>
              </div>
            ) : null}
          </div>
        )}
      </article>
    </section>
  );
}
