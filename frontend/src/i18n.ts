import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import login_en from "./locales/en/login.json";
import home_en from "./locales/en/home.json";
import schedule_en from "./locales/en/schedule.json";
import account_en from "./locales/en/account.json";
import nav_en from "./locales/en/nav.json";
import detail_en from "./locales/en/detail.json";
import courseCard_en from "./locales/en/courseCard.json";

import login_zh from "./locales/zh/login.json";
import home_zh from "./locales/zh/home.json";
import schedule_zh from "./locales/zh/schedule.json";
import account_zh from "./locales/zh/account.json";
import nav_zh from "./locales/zh/nav.json";
import detail_zh from "./locales/zh/detail.json";
import courseCard_zh from "./locales/zh/courseCard.json";

// 定义所有命名空间
const resources = {
  en: {
    login: login_en,
    home: home_en,
    schedule: schedule_en,
    account: account_en,
    nav: nav_en,
    detail: detail_en,
    courseCard: courseCard_en,
  },
  zh: {
    login: login_zh,
    home: home_zh,
    schedule: schedule_zh,
    account: account_zh,
    nav: nav_zh,
    detail: detail_zh,
    courseCard: courseCard_zh,
  },
};

i18n
  .use(LanguageDetector) // 👈 自动检测用户语言
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // 检测不到时默认英语
    ns: ["login", "home", "schedule", "account", "nav", "detail", "courseCard"], // 声明所有命名空间
    defaultNS: "home", // 默认namespace
    interpolation: { escapeValue: false },
    detection: {
      // 可选配置：可自动从浏览器/HTML/localStorage等多方式检测
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"], // 用户手动切换后会自动记住
    },
  });

export default i18n;
