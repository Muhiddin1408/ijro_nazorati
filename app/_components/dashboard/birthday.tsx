"use client";

/** Birthday greeting page (the viewer's own birthday) and the colleagues' birthday strip on the home page. */
import "../../styles/birthday.css";
import { Cake, Gift, PartyPopper } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import type { BirthdayPerson } from "./dashboard-types";

/** Remembers per employee and date that the greeting was closed, so it opens once a day. */
export function birthdaySeenKey(employeeId: number, date: string) {
  return `ijro-birthday-seen:${employeeId}:${date}`;
}

const CONFETTI = Array.from({ length: 18 }, (_, index) => index);

export function BirthdayGreeting({ name, onContinue }: { name: string; onContinue: () => void }) {
  const { t, tx } = useI18n();
  return (
    <section className="birthday-greeting" aria-labelledby="birthday-greeting-title">
      <div className="birthday-confetti" aria-hidden="true">
        {CONFETTI.map((index) => (
          <i key={index} />
        ))}
      </div>
      <div className="birthday-card">
        <span className="birthday-icon" aria-hidden="true">
          <Cake size={44} />
        </span>
        <p className="birthday-kicker">
          <PartyPopper size={16} aria-hidden="true" /> {t("Tug‘ilgan kuningiz muborak!")}
        </p>
        <h1 id="birthday-greeting-title">{t("Hurmatli {name}!", { name: tx(name) })}</h1>
        <p className="birthday-message">
          {t(
            "Jamoamiz nomidan sizni tavallud ayyomingiz bilan chin qalbdan tabriklaymiz! Sizga mustahkam sog‘liq, oilaviy baxt-saodat va ishlaringizda ulkan muvaffaqiyatlar tilaymiz.",
          )}
        </p>
        <button className="primary-button birthday-continue" onClick={onContinue} autoFocus>
          {t("Ish stoliga o‘tish")}
        </button>
      </div>
    </section>
  );
}

export function BirthdayStrip({ people }: { people: BirthdayPerson[] }) {
  const { t, tx } = useI18n();
  if (!people.length) return null;
  return (
    <article className="birthday-strip" aria-label={t("Bugungi tug‘ilgan kunlar")}>
      <span className="birthday-strip-icon" aria-hidden="true">
        <Gift size={20} />
      </span>
      <div className="birthday-strip-text">
        <strong>
          {people.length === 1
            ? t("Bugun hamkasbingizning tug‘ilgan kuni")
            : t("Bugun {n} nafar hamkasbingizning tug‘ilgan kuni", { n: people.length })}
        </strong>
        <small>{t("Tabriklashni unutmang!")}</small>
      </div>
      <ul className="birthday-people">
        {people.map((person) => (
          <li key={person.id}>
            <Cake size={14} aria-hidden="true" />
            <span>
              <b>{tx(person.name)}</b>
              {person.position ? <small>{tx(person.position)}</small> : null}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
