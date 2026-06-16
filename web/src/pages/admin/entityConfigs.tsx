import type { CrudField } from "./CrudManager";

interface EntityConfig {
  title: string;
  description: string;
  path: string;
  fields: CrudField[];
  columns: { name: string; label: string; type?: "image" | "boolean" }[];
}

export const entityConfigs: Record<string, EntityConfig> = {
  doctors: {
    title: "Врачи",
    description: "Управление профилями врачей",
    path: "doctors",
    fields: [
      { name: "name", label: "ФИО", type: "text" },
      { name: "slug", label: "Адрес страницы (slug)", type: "text", placeholder: "оставьте пустым — создастся автоматически из ФИО" },
      { name: "specialty", label: "Специальность", type: "text" },
      { name: "experience", label: "Стаж", type: "text", placeholder: "Стаж 5 лет" },
      { name: "price", label: "Цена приёма", type: "text", placeholder: "от 5 000 ₽" },
      { name: "imageUrl", label: "Фото", type: "image" },
      { name: "quote", label: "Цитата врача (крупная, на главной)", type: "textarea", placeholder: "Личное кредо или обращение к пациентам" },
      { name: "about", label: "О враче (абзацы — через пустую строку)", type: "textarea" },
      { name: "credentials", label: "Регалии и достижения", type: "list", placeholder: "Например: Врач высшей категории" },
      { name: "available", label: "Доступен для записи", type: "boolean" },
      { name: "availableDate", label: "Дата приёма", type: "text", placeholder: "сегодня / с 2 июня" },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать на сайте", type: "boolean" },
    ],
    columns: [
      { name: "imageUrl", label: "Фото", type: "image" },
      { name: "name", label: "ФИО" },
      { name: "specialty", label: "Специальность" },
      { name: "available", label: "Доступен", type: "boolean" },
      { name: "active", label: "Активен", type: "boolean" },
    ],
  },
  myths: {
    title: "Мифы о здоровье",
    description: "Блок «Доказательная медицина против мифов»",
    path: "myths",
    fields: [
      { name: "tag", label: "Тема", type: "text", placeholder: "Вирусология" },
      { name: "question", label: "Вопрос/миф", type: "text" },
      {
        name: "verdictType",
        label: "Вердикт",
        type: "select",
        options: [
          { label: "Миф", value: "myth" },
          { label: "Частично правда", value: "partial" },
          { label: "Правда", value: "truth" },
        ],
        defaultValue: "myth",
      },
      { name: "answer", label: "Ответ", type: "textarea" },
      { name: "source", label: "Источник", type: "text", placeholder: "ВОЗ, 2023" },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать", type: "boolean" },
    ],
    columns: [
      { name: "tag", label: "Тема" },
      { name: "question", label: "Вопрос" },
      { name: "verdictType", label: "Вердикт" },
      { name: "active", label: "Активен", type: "boolean" },
    ],
  },
  reviews: {
    title: "Отзывы",
    description: "Отзывы пациентов",
    path: "reviews",
    fields: [
      { name: "name", label: "Имя", type: "text" },
      { name: "date", label: "Дата", type: "text", placeholder: "март 2024" },
      { name: "rating", label: "Оценка (1-5)", type: "number", defaultValue: 5 },
      { name: "text", label: "Текст отзыва", type: "textarea" },
      { name: "platform", label: "Платформа", type: "text", placeholder: "Яндекс Карты" },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать", type: "boolean" },
    ],
    columns: [
      { name: "name", label: "Имя" },
      { name: "rating", label: "Оценка" },
      { name: "platform", label: "Платформа" },
      { name: "active", label: "Активен", type: "boolean" },
    ],
  },
  promotions: {
    title: "Акции",
    description: "Акции и спецпредложения. У каждой акции есть отдельная страница на сайте.",
    path: "promotions",
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "slug", label: "Адрес страницы (латиницей)", type: "text", placeholder: "оставьте пустым — создастся автоматически" },
      { name: "badge", label: "Бейдж (крупная выгода)", type: "text", placeholder: "−30% или Бесплатно" },
      { name: "date", label: "Срок действия", type: "text", placeholder: "до 30 июня 2026" },
      { name: "description", label: "Краткое описание (для карточки)", type: "textarea" },
      { name: "intro", label: "Вводный текст (на странице акции)", type: "textarea" },
      { name: "body", label: "Подробное описание (абзацы — через пустую строку)", type: "textarea" },
      { name: "imageUrl", label: "Изображение карточки", type: "image" },
      { name: "heroImageUrl", label: "Изображение на странице (необязательно)", type: "image" },
      {
        name: "serviceIds",
        label: "Связанные услуги",
        type: "multiselect",
        optionsPath: "/api/admin/services",
        optionLabel: "name",
        optionValue: "id",
      },
      { name: "metaTitle", label: "SEO-заголовок", type: "text" },
      { name: "metaDescription", label: "SEO-описание", type: "textarea" },
      { name: "featured", label: "Показывать в карусели на главной", type: "boolean" },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать на сайте", type: "boolean" },
    ],
    columns: [
      { name: "title", label: "Заголовок" },
      { name: "badge", label: "Бейдж" },
      { name: "imageUrl", label: "Картинка", type: "image" },
      { name: "featured", label: "В карусели", type: "boolean" },
      { name: "active", label: "Активна", type: "boolean" },
    ],
  },
  benefits: {
    title: "Преимущества",
    description: "Блок преимуществ клиники",
    path: "benefits",
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "text", label: "Текст", type: "textarea" },
      { name: "icon", label: "Иконка (lucide)", type: "text", placeholder: "shield-check" },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать", type: "boolean" },
    ],
    columns: [
      { name: "title", label: "Заголовок" },
      { name: "icon", label: "Иконка" },
      { name: "active", label: "Активно", type: "boolean" },
    ],
  },
  stats: {
    title: "Статистика",
    description: "Цифры в шапке (лет работы, специалистов и т.д.)",
    path: "stats",
    fields: [
      { name: "value", label: "Значение", type: "text", placeholder: "15+" },
      { name: "label", label: "Подпись", type: "text", placeholder: "лет работы" },
      { name: "sortOrder", label: "Порядок", type: "number" },
    ],
    columns: [
      { name: "value", label: "Значение" },
      { name: "label", label: "Подпись" },
    ],
  },
  "nav-links": {
    title: "Меню навигации",
    description: "Ссылки в шапке сайта",
    path: "nav-links",
    fields: [
      { name: "label", label: "Название", type: "text" },
      { name: "href", label: "Ссылка", type: "text", placeholder: "#services" },
      {
        name: "group",
        label: "Группа",
        type: "select",
        options: [
          { label: "Основное меню", value: "main" },
          { label: "Доп. меню", value: "secondary" },
        ],
        defaultValue: "main",
      },
      { name: "sortOrder", label: "Порядок", type: "number" },
      { name: "active", label: "Показывать", type: "boolean" },
    ],
    columns: [
      { name: "label", label: "Название" },
      { name: "href", label: "Ссылка" },
      { name: "group", label: "Группа" },
      { name: "active", label: "Активна", type: "boolean" },
    ],
  },
};
