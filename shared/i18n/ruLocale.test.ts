import { ru } from "date-fns/locale/ru";
import { describe, expect, it } from "vitest";
import { dateLocale } from "../utils/date";
import { languages } from "./index";

describe("outline-rus languages", () => {
  it("exposes only en_US and ru_RU", () => {
    expect(languages).toEqual(["en_US", "ru_RU"]);
  });

  it("formats dates in Russian", () => {
    expect(dateLocale("ru_RU")).toBe(ru);
  });
});
