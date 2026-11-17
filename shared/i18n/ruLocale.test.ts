import fs from "node:fs";
import path from "node:path";
import { ru } from "date-fns/locale/ru";
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

  it("uses a distinct form for _plural keys", () => {
    const en = readLocale("en_US");
    const translated = readLocale("ru_RU");
    const collapsed = Object.keys(en).filter((key) => {
      if (!key.endsWith("_plural")) {
        return false;
      }
      const singularKey = key.slice(0, -"_plural".length);
      if (!(singularKey in en) || en[singularKey] === en[key]) {
        return false;
      }
      return translated[singularKey] === translated[key];
    });
    expect(collapsed).toEqual([]);
  });
});
