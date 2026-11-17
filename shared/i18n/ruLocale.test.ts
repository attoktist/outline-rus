import fs from "node:fs";
import path from "node:path";
import { ru } from "date-fns/locale/ru";
import { createInstance } from "i18next";
import { describe, expect, it } from "vitest";
import { dateLocale } from "../utils/date";
import { languages } from "./index";

const readLocale = (locale: string): Record<string, string> =>
  JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, "locales", locale, "translation.json"),
      "utf8"
    )
  );

const preservedToken =
  /https?:\/\/[^\s)"']+|`[^`]+`|<\/?[a-zA-Z][^>]*>|⌘|(?:Ctrl|Cmd|Shift|Alt|Opt)\+/g;

const tokens = (text: string) =>
  Array.from(text.matchAll(preservedToken), (match) => match[0]).sort();

const englishProse =
  /\b(the|to|you|your|this|with|for|and|are|from|of|in|on|is|be|it|or|not)\b/i;

describe("outline-rus languages", () => {
  it("exposes only en_US and ru_RU", () => {
    expect(languages).toEqual(["en_US", "ru_RU"]);
  });

  it("formats dates in Russian", () => {
    expect(dateLocale("ru_RU")).toBe(ru);
  });

  it("ru_RU has every en_US key", () => {
    const en = readLocale("en_US");
    const translated = readLocale("ru_RU");
    const missing = Object.keys(en).filter(
      (key) => !(key in translated) || translated[key] === ""
    );
    expect(missing).toEqual([]);
  });

  it("keeps chords, urls, backticks, and HTML tags", () => {
    const en = readLocale("en_US");
    const translated = readLocale("ru_RU");
    const errors = Object.keys(en).flatMap((key) => {
      const expected = tokens(key);
      if (expected.length === 0) {
        return [];
      }
      const actual = tokens(translated[key] ?? "");
      return JSON.stringify(expected) === JSON.stringify(actual)
        ? []
        : [
            `${JSON.stringify(key)} has ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
          ];
    });
    expect(errors).toEqual([]);
  });

  it("translates English sentences", () => {
    const translated = readLocale("ru_RU");
    const copied = Object.keys(translated).filter(
      (key) => translated[key] === key && englishProse.test(key)
    );
    expect(copied).toEqual([]);
  });

  it("selects Russian plural suffixes at runtime", async () => {
    const en = readLocale("en_US");
    const translated = readLocale("ru_RU");
    const instance = createInstance();
    await instance.init({
      compatibilityJSON: "v3",
      lng: "ru-RU",
      resources: { "ru-RU": { translation: translated } },
      keySeparator: false,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
    const counts = { 1: "_0", 2: "_1", 5: "_2" } as const;

    for (const key of Object.keys(en)) {
      if (!key.endsWith("_plural")) {
        continue;
      }
      const base = key.slice(0, -"_plural".length);
      for (const [count, suffix] of Object.entries(counts)) {
        const form = `${base}${suffix}`;
        expect(translated[form], form).toBeTruthy();
        expect(
          instance.t(base, {
            count: Number(count),
            count2: Number(count),
            usersCount: Number(count),
            groupsCount: Number(count),
            total: Number(count),
            completed: Number(count),
            number: Number(count),
            releasesBehind: Number(count),
            any: Number(count),
          })
        ).toBe(
          instance.t(form, {
            count: Number(count),
            count2: Number(count),
            usersCount: Number(count),
            groupsCount: Number(count),
            total: Number(count),
            completed: Number(count),
            number: Number(count),
            releasesBehind: Number(count),
            any: Number(count),
          })
        );
      }
    }
  });

  it("resolves Russian one, few, and many", async () => {
    const instance = createInstance();
    await instance.init({
      compatibilityJSON: "v3",
      lng: "ru-RU",
      resources: { "ru-RU": { translation: readLocale("ru_RU") } },
      keySeparator: false,
      interpolation: { escapeValue: false },
      returnNull: false,
    });

    expect(instance.t("{{ count }} comment", { count: 1 })).toBe(
      "1 комментарий"
    );
    expect(instance.t("{{ count }} comment", { count: 2 })).toBe(
      "2 комментария"
    );
    expect(instance.t("{{ count }} comment", { count: 5 })).toBe(
      "5 комментариев"
    );
    expect(instance.t("{{ count }} comment", { count: 21 })).toBe(
      "21 комментарий"
    );
  });
});
