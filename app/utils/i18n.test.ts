import i18n from "i18next";
import en_US from "../../shared/i18n/locales/en_US/translation.json";
import ru_RU from "../../shared/i18n/locales/ru_RU/translation.json";

// i18n is already initialized globally via app/test/setup.ts — only add
// test resources here, without re-initializing the singleton.
beforeAll(() => {
  i18n
    .addResources("en-US", "translation", en_US)
    .addResources("ru-RU", "translation", ru_RU);
});

describe("i18n env is unset", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en-US");
  });

  it("translation of key should match", () =>
    expect(i18n.t("Saving")).toBe("Saving"));

  it("translation if changed to ru-RU", async () => {
    await i18n.changeLanguage("ru-RU");
    expect(i18n.t("Saving")).toBe("Сохранение");
  });
});

describe("i18n env is en-US", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en-US");
  });

  it("translation of key should match", () =>
    expect(i18n.t("Saving")).toBe("Saving"));

  it("translation if changed to ru-RU", async () => {
    await i18n.changeLanguage("ru-RU");
    expect(i18n.t("Saving")).toBe("Сохранение");
  });
});

describe("i18n env is ru-RU", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ru-RU");
  });

  it("translation of key should match", () =>
    expect(i18n.t("Saving")).toBe("Сохранение"));

  it("translation if changed to en-US", async () => {
    await i18n.changeLanguage("en-US");
    expect(i18n.t("Saving")).toBe("Saving");
  });

  it("uses one, few, and many", () => {
    expect(i18n.t("{{ count }} comment", { count: 1 })).toBe("1 комментарий");
    expect(i18n.t("{{ count }} comment", { count: 2 })).toBe("2 комментария");
    expect(i18n.t("{{ count }} comment", { count: 5 })).toBe("5 комментариев");
  });
});
