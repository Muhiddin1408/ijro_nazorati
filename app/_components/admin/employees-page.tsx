"use client";

import {
  Download,
  KeyRound,
  Link2,
  LockKeyhole,
  Search,
  Send,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageIntro, hierarchicalOrganizationOptions } from "../../dashboard-kit";
import { avatarColor, formatDateTime, initials, searchMatches } from "../../ui-helpers";
import { loadXlsx } from "../../excel-client";
import { useVirtualList, virtualItemProps } from "../ui/use-virtual-list";
import type {
  AdminOrganization,
  AdminEmployee,
  AdminRole,
  RequestProvisioning,
  DownloadProvisioningWorkbook,
} from "./admin-types";
import { Summary } from "./admin-helpers";
import { confirmDialog } from "../ui/confirm-dialog";
import { useI18n } from "../../../lib/i18n";

export function EmployeesPage({
  employees,
  roles,
  organizations,
  canProvision,
  onAdd,
  onEdit,
  onLink,
  requestProvisioning,
  downloadProvisioningWorkbook,
}: {
  employees: AdminEmployee[];
  roles: AdminRole[];
  organizations: AdminOrganization[];
  canProvision: boolean;
  onAdd: () => void;
  onEdit: (employee: AdminEmployee) => void;
  onLink: (employee: AdminEmployee) => void;
  requestProvisioning: RequestProvisioning;
  downloadProvisioningWorkbook: DownloadProvisioningWorkbook;
}) {
  const { t, tx } = useI18n();
  const [query, setQuery] = useState("");
  const [roleId, setRoleId] = useState("all");
  const [accountState, setAccountState] = useState("all");
  const [activityState, setActivityState] = useState("active");
  const [organizationId, setOrganizationId] = useState(() => {
    const central = organizations.find((organization) => organization.active && organization.type === "central");
    return central ? String(central.id) : "all";
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkNotice, setBulkNotice] = useState("");
  const [reissueMode, setReissueMode] = useState(false);
  const managerById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);
  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          (organizationId === "all" || employee.organizationId === Number(organizationId)) &&
          (roleId === "all" || employee.roleId === Number(roleId)) &&
          (accountState === "all" ||
            (accountState === "configured" ? employee.loginConfigured : !employee.loginConfigured)) &&
          (activityState === "all" || (activityState === "active" ? employee.active : !employee.active)) &&
          searchMatches(query, [
            employee.name,
            employee.fullNameCyrillic,
            employee.username,
            employee.position,
            employee.department,
            employee.organization,
            employee.internalExtension,
            employee.mobilePhone,
          ]),
      ),
    [accountState, activityState, employees, organizationId, query, roleId],
  );
  const visibleEmployees = useMemo(() => filteredEmployees.slice(0, 250), [filteredEmployees]);
  const selectableVisible = useMemo(
    () =>
      visibleEmployees.filter(
        (employee) => employee.active && (reissueMode ? employee.loginConfigured : !employee.loginConfigured),
      ),
    [reissueMode, visibleEmployees],
  );
  // Only rows near the viewport are rendered; the checkbox logic above still
  // works on the full visible set.
  const { attach: attachTableRows, ...tableRows } = useVirtualList({
    count: visibleEmployees.length,
    estimateRowHeight: 64,
    threshold: 60,
  });
  const { attach: attachMobileCards, ...mobileCards } = useVirtualList({
    count: visibleEmployees.length,
    estimateRowHeight: 190,
    threshold: 30,
  });
  const selectableIdSet = useMemo(() => new Set(selectableVisible.map((employee) => employee.id)), [selectableVisible]);
  const selectedForProvisioning = selected.filter((id) => selectableIdSet.has(id));

  async function createCredentialPack() {
    if (!selectedForProvisioning.length || bulkBusy) return;
    const confirmation = reissueMode
      ? t(
          "{n} ta xodimning amaldagi paroli bekor qilinadi va yangi vaqtinchalik parol yaratiladi. Xodimlar eski parol bilan kira olmaydi. Davom etasizmi?",
          { n: selectedForProvisioning.length },
        )
      : t(
          "{n} ta xodim uchun login va vaqtinchalik parol yaratiladi. Parollar faqat bir martalik Excel faylda ko‘rinadi. Davom etasizmi?",
          { n: selectedForProvisioning.length },
        );
    if (
      !(await confirmDialog({
        title: reissueMode ? t("Parollarni qayta yaratish") : t("Kirish ma’lumotlarini yaratish"),
        message: confirmation,
        confirmLabel: reissueMode ? t("Parollarni yangilash") : t("Yaratish"),
        tone: reissueMode ? "danger" : "default",
      }))
    )
      return;
    try {
      setBulkBusy(true);
      const spreadsheetReady = loadXlsx();
      const result = await requestProvisioning({
        kind: "employees",
        employeeIds: selectedForProvisioning,
        reissue: reissueMode,
      });
      await spreadsheetReady;
      await downloadProvisioningWorkbook(result);
      setSelected([]);
      setBulkNotice(
        [
          reissueMode
            ? t("{n} ta yangilangan parol bir martalik Excel faylga yuklandi", { n: result.accounts.length })
            : t("{n} ta login va vaqtinchalik parol bir martalik Excel faylga yuklandi", { n: result.accounts.length }),
          result.failure ? t("Jarayon qisman bajarildi: {reason}", { reason: result.failure }) : "",
          result.skipped.length ? t("{n} ta hisob o‘tkazib yuborildi", { n: result.skipped.length }) : "",
        ]
          .filter(Boolean)
          .join(". ") + ".",
      );
    } catch (error) {
      setBulkNotice(error instanceof Error ? error.message : t("Kirish ma’lumotlari yaratilmadi"));
    } finally {
      setBulkBusy(false);
    }
  }
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ADMINISTRATOR")}
        title={t("Xodimlar va akkauntlar")}
        description={t(
          "Xodim, rol va kirish holatini nazorat qiling. Vaqtinchalik parol faqat bir martalik maxfiy Excel faylga chiqariladi.",
        )}
        actions={
          <>
            {canProvision ? (
              <button
                className={`secondary-button credential-export-button ${reissueMode ? "reissue" : ""}`}
                disabled={!selectedForProvisioning.length || bulkBusy}
                onClick={() => void createCredentialPack()}
              >
                <Download size={17} />
                {bulkBusy
                  ? t("Tayyorlanmoqda...")
                  : `${reissueMode ? t("Yangi parollar Excel") : t("Login-parol Excel")}${selectedForProvisioning.length ? ` (${selectedForProvisioning.length})` : ""}`}
              </button>
            ) : null}
            <button className="primary-button" onClick={onAdd}>
              <UserPlus size={17} /> {t("Xodim qo‘shish")}
            </button>
          </>
        }
      />
      <article className="panel directory-toolbar account-directory-toolbar">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("F.I.Sh., login, lavozim yoki bo‘lim...")}
          />
        </label>
        <select
          aria-label={t("Tashkilot bo‘yicha filtrlash")}
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
        >
          <option value="all">{t("Barcha tashkilotlar")}</option>
          {hierarchicalOrganizationOptions(organizations).map(({ organization, depth }) => (
            <option
              key={organization.id}
              value={organization.id}
            >{`${"— ".repeat(depth)}${tx(organization.shortName || organization.name)}`}</option>
          ))}
        </select>
        <select
          aria-label={t("Rol bo‘yicha filtrlash")}
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
        >
          <option value="all">{t("Barcha rollar")}</option>
          {roles
            .filter((role) => role.active)
            .map((role) => (
              <option key={role.id} value={role.id}>
                {tx(role.name)}
              </option>
            ))}
        </select>
        <select
          aria-label={t("Akkaunt holati bo‘yicha filtrlash")}
          value={accountState}
          onChange={(event) => setAccountState(event.target.value)}
        >
          <option value="all">{t("Barcha kirish holatlari")}</option>
          <option value="missing">{t("Login yaratilmagan")}</option>
          <option value="configured">{t("Login yaratilgan")}</option>
        </select>
        <select
          aria-label={t("Xodim faolligi bo‘yicha filtrlash")}
          value={activityState}
          onChange={(event) => setActivityState(event.target.value)}
        >
          <option value="active">{t("Faol xodimlar")}</option>
          <option value="inactive">{t("Faol bo‘lmaganlar")}</option>
          <option value="all">{t("Barcha xodimlar")}</option>
        </select>
        <span>{t("{shown}/{total} ta", { shown: visibleEmployees.length, total: filteredEmployees.length })}</span>
      </article>
      {bulkNotice ? (
        <div className="secure-note">
          <ShieldCheck size={18} />
          <div>
            <strong>{t("Akkaunt faollashtirish")}</strong>
            <span>{bulkNotice}</span>
          </div>
          <button className="icon-button" onClick={() => setBulkNotice("")} aria-label={t("Yopish")}>
            <X size={15} />
          </button>
        </div>
      ) : null}
      <div className={`credential-security-note ${reissueMode ? "reissue-warning" : ""}`} role="note">
        <LockKeyhole size={18} />
        <div>
          <strong>{reissueMode ? t("Mavjud parollarni yangilash rejimi") : t("Bir martalik xavfsiz tarqatish")}</strong>
          <span>
            {canProvision
              ? reissueMode
                ? t(
                    "Tanlangan xodimlarning eski paroli darhol bekor qilinadi. Bu rejimdan faqat parol yo‘qolganida yoki xavfsizlik talabi bo‘yicha foydalaning.",
                  )
                : t(
                    "Tizim ochiq parolni saqlamaydi va keyin qayta ko‘rsatmaydi. Excel faylni faqat tegishli xodimlarga himoyalangan kanal orqali yuboring.",
                  )
              : t("Login va parollarni ommaviy yaratish faqat tizim administratori vakolatiga kiradi.")}
          </span>
        </div>
        {canProvision ? (
          <label className="reissue-toggle">
            <input
              type="checkbox"
              checked={reissueMode}
              onChange={(event) => {
                const enabled = event.target.checked;
                setReissueMode(enabled);
                setAccountState(enabled ? "configured" : "missing");
                setSelected([]);
              }}
            />
            <span>
              <strong>{t("Mavjud login parolini yangilash")}</strong>
              <small>{t("Oddiy yaratishda o‘chirilgan")}</small>
            </span>
          </label>
        ) : null}
      </div>
      <div className="summary-strip">
        <Summary
          icon={<Users size={20} />}
          tone="blue"
          label={t("Jami xodim")}
          value={t("{n} nafar", { n: employees.length })}
        />
        <Summary
          icon={<KeyRound size={20} />}
          tone="green"
          label={t("Login yaratilgan")}
          value={t("{n} nafar", { n: employees.filter((item) => item.loginConfigured).length })}
        />
        <Summary
          icon={<Send size={20} />}
          tone="violet"
          label={t("Telegram ulangan")}
          value={t("{n} nafar", { n: employees.filter((item) => item.telegramLinked).length })}
        />
        <Summary
          icon={<ShieldCheck size={20} />}
          tone="amber"
          label={t("Faol rollar")}
          value={t("{n} ta", { n: roles.filter((item) => item.active).length })}
        />
      </div>
      <article className="panel admin-table">
        <div className="table-wrap">
          <table aria-rowcount={visibleEmployees.length + 1}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label={t("Barchasini tanlash")}
                    disabled={!canProvision}
                    checked={
                      canProvision &&
                      selectableVisible.length > 0 &&
                      selectableVisible.every((item) => selected.includes(item.id))
                    }
                    onChange={(event) =>
                      setSelected(event.target.checked ? selectableVisible.map((item) => item.id) : [])
                    }
                  />
                </th>
                <th>{t("Xodim")}</th>
                <th>{t("Aloqa ma’lumotlari")}</th>
                <th>{t("Login")}</th>
                <th>{t("Rol")}</th>
                <th>{t("Tashkilot / bo‘lim")}</th>
                <th>{t("Rahbar")}</th>
                <th>Telegram</th>
                <th>{t("Holat")}</th>
                <th />
              </tr>
            </thead>
            <tbody ref={attachTableRows}>
              {tableRows.padTop ? (
                <tr aria-hidden="true" style={{ height: tableRows.padTop }}>
                  <td colSpan={10} style={{ padding: 0, border: 0 }} />
                </tr>
              ) : null}
              {visibleEmployees.slice(tableRows.start, tableRows.end).map((employee, offset) => {
                const manager = employee.managerId ? managerById.get(employee.managerId) : null;
                const index = tableRows.start + offset;
                return (
                  <tr key={employee.id} aria-rowindex={index + 2} {...virtualItemProps(index)}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={t("{name} akkauntini tanlash", { name: tx(employee.name) })}
                        disabled={
                          !canProvision ||
                          !employee.active ||
                          (reissueMode ? !employee.loginConfigured : employee.loginConfigured)
                        }
                        checked={selected.includes(employee.id)}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked
                              ? [...current, employee.id]
                              : current.filter((id) => id !== employee.id),
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="employee-cell">
                        <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
                        <span>
                          <strong>{tx(employee.name)}</strong>
                          {employee.email ? (
                            <small data-alphabet-static="true">{employee.email}</small>
                          ) : (
                            <small>{t("Pochta kiritilmagan")}</small>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {employee.internalExtension
                          ? t("Ichki: {ext}", { ext: employee.internalExtension })
                          : t("Ichki raqam yo‘q")}
                      </strong>
                      <small className="table-subtext">{employee.mobilePhone ?? t("Telefon kiritilmagan")}</small>
                      <small className="table-subtext">
                        {employee.birthDate
                          ? t("Tug‘ilgan sana: {date}", { date: formatDateTime(employee.birthDate, true) })
                          : t("Tug‘ilgan sana kiritilmagan")}
                      </small>
                    </td>
                    <td>
                      {employee.loginConfigured ? (
                        <span className="connection-pill connected">
                          <KeyRound size={13} />
                          <span data-alphabet-static="true">@{employee.username}</span>
                        </span>
                      ) : (
                        <span className="connection-pill">
                          <LockKeyhole size={13} />
                          {t("Yaratilmagan")}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{tx(employee.roleName)}</strong>
                      <small className="table-subtext">{tx(employee.position)}</small>
                    </td>
                    <td>
                      <strong>{tx(employee.organization)}</strong>
                      <small className="table-subtext">{tx(employee.department)}</small>
                    </td>
                    <td>{manager ? tx(manager.name) : "—"}</td>
                    <td>
                      <button
                        className={`connection-pill ${employee.telegramLinked ? "connected" : ""}`}
                        onClick={() => onLink(employee)}
                      >
                        {employee.telegramLinked ? <Wifi size={13} /> : <Link2 size={13} />}
                        {employee.telegramLinked ? (
                          employee.telegramUsername ? (
                            <span data-alphabet-static="true">@{employee.telegramUsername}</span>
                          ) : (
                            t("Ulangan")
                          )
                        ) : (
                          t("Ulash")
                        )}
                      </button>
                    </td>
                    <td>
                      <span className={`status ${employee.active ? "status-bajarildi" : "status-kechikkan"}`}>
                        {employee.active ? t("Faol") : t("Faol emas")}
                      </span>
                    </td>
                    <td>
                      <button className="secondary-button compact-button" onClick={() => onEdit(employee)}>
                        <UserCog size={15} /> {t("Tahrirlash")}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {tableRows.padBottom ? (
                <tr aria-hidden="true" style={{ height: tableRows.padBottom }}>
                  <td colSpan={10} style={{ padding: 0, border: 0 }} />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
      <div className="employee-mobile-list" ref={attachMobileCards}>
        {mobileCards.padTop ? <div aria-hidden="true" style={{ height: mobileCards.padTop }} /> : null}
        {visibleEmployees.slice(mobileCards.start, mobileCards.end).map((employee, offset) => {
          const manager = employee.managerId ? managerById.get(employee.managerId) : null;
          return (
            <article
              className="panel employee-mobile-card"
              key={employee.id}
              {...virtualItemProps(mobileCards.start + offset)}
            >
              <header>
                <input
                  type="checkbox"
                  aria-label={t("{name} akkauntini tanlash", { name: tx(employee.name) })}
                  disabled={
                    !canProvision ||
                    !employee.active ||
                    (reissueMode ? !employee.loginConfigured : employee.loginConfigured)
                  }
                  checked={selected.includes(employee.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked ? [...current, employee.id] : current.filter((id) => id !== employee.id),
                    )
                  }
                />
                <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
                <div>
                  <strong>{tx(employee.name)}</strong>
                  <small>{tx(employee.position || employee.roleName)}</small>
                </div>
                <span className={`status ${employee.active ? "status-bajarildi" : "status-kechikkan"}`}>
                  {employee.active ? t("Faol") : t("Faol emas")}
                </span>
              </header>
              <dl>
                <div>
                  <dt>{t("Tashkilot")}</dt>
                  <dd>{employee.organization ? tx(employee.organization) : t("Biriktirilmagan")}</dd>
                </div>
                <div>
                  <dt>{t("Bo‘lim")}</dt>
                  <dd>{employee.department ? tx(employee.department) : t("Biriktirilmagan")}</dd>
                </div>
                <div>
                  <dt>{t("Rol")}</dt>
                  <dd>{tx(employee.roleName)}</dd>
                </div>
                <div>
                  <dt>{t("Rahbar")}</dt>
                  <dd>{manager ? tx(manager.name) : t("Biriktirilmagan")}</dd>
                </div>
              </dl>
              <footer>
                <span className={`connection-pill ${employee.loginConfigured ? "connected" : ""}`}>
                  <KeyRound size={13} />
                  {employee.loginConfigured ? (
                    <span data-alphabet-static="true">@{employee.username}</span>
                  ) : (
                    t("Login yaratilmagan")
                  )}
                </span>
                <button
                  className={`connection-pill ${employee.telegramLinked ? "connected" : ""}`}
                  onClick={() => onLink(employee)}
                >
                  {employee.telegramLinked ? <Wifi size={13} /> : <Link2 size={13} />}
                  {employee.telegramLinked ? t("Telegram ulangan") : t("Telegram ulash")}
                </button>
                <button className="secondary-button compact-button" onClick={() => onEdit(employee)}>
                  <UserCog size={14} /> {t("Tahrirlash")}
                </button>
              </footer>
            </article>
          );
        })}
        {mobileCards.padBottom ? <div aria-hidden="true" style={{ height: mobileCards.padBottom }} /> : null}
        {!visibleEmployees.length ? (
          <div className="empty-state">
            <Users size={24} />
            <strong>{t("Filtrga mos xodim topilmadi")}</strong>
            <span>{t("Filtrlarni tozalang yoki boshqa tashkilotni tanlang.")}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
