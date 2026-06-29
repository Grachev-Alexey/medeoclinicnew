"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type Font = "normal" | "large" | "xlarge";
type Scheme = "white" | "black" | "blue";
type Spacing = "normal" | "medium" | "large";

type Settings = {
  enabled: boolean;
  font: Font;
  scheme: Scheme;
  spacing: Spacing;
  images: boolean;
  serif: boolean;
};

const DEFAULT: Settings = {
  enabled: false,
  font: "normal",
  scheme: "white",
  spacing: "normal",
  images: true,
  serif: false,
};

const STORAGE_KEY = "medeo-a11y";

const A11Y_ATTRS = [
  "data-a11y",
  "data-a11y-font",
  "data-a11y-scheme",
  "data-a11y-spacing",
  "data-a11y-images",
  "data-a11y-serif",
];

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function sanitize(raw: unknown): Settings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    enabled: s.enabled === true,
    font: oneOf(s.font, ["normal", "large", "xlarge"] as const, "normal"),
    scheme: oneOf(s.scheme, ["white", "black", "blue"] as const, "white"),
    spacing: oneOf(s.spacing, ["normal", "medium", "large"] as const, "normal"),
    images: s.images !== false,
    serif: s.serif === true,
  };
}

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  enable: () => void;
  disable: () => void;
};

const AccessibilityContext = createContext<Ctx | null>(null);

export function useAccessibility(): Ctx {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within <AccessibilityProvider>",
    );
  }
  return ctx;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(sanitize(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const el = document.documentElement;
    if (settings.enabled) {
      el.setAttribute("data-a11y", "on");
      el.setAttribute("data-a11y-font", settings.font);
      el.setAttribute("data-a11y-scheme", settings.scheme);
      el.setAttribute("data-a11y-spacing", settings.spacing);
      el.setAttribute("data-a11y-images", settings.images ? "on" : "off");
      el.setAttribute("data-a11y-serif", settings.serif ? "on" : "off");
    } else {
      A11Y_ATTRS.forEach((a) => el.removeAttribute(a));
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, loaded]);

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );
  const enable = useCallback(
    () => setSettings((s) => ({ ...s, enabled: true })),
    [],
  );
  const disable = useCallback(
    () => setSettings((s) => ({ ...s, enabled: false })),
    [],
  );

  return (
    <AccessibilityContext.Provider value={{ settings, update, enable, disable }}>
      {children}
      <AccessibilityBar />
    </AccessibilityContext.Provider>
  );
}

function Seg({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className="a11y-seg"
      data-active={active}
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function AccessibilityBar() {
  const { settings, update, disable } = useAccessibility();
  if (!settings.enabled) return null;

  const { font, scheme, spacing, images, serif } = settings;

  return (
    <div
      className="a11y-bar"
      role="region"
      aria-label="Настройки версии для слабовидящих"
      data-testid="bar-accessibility"
    >
      <span className="a11y-label">Размер шрифта</span>
      <Seg active={font === "normal"} onClick={() => update({ font: "normal" })} ariaLabel="Обычный шрифт">
        А
      </Seg>
      <Seg active={font === "large"} onClick={() => update({ font: "large" })} ariaLabel="Крупный шрифт">
        А+
      </Seg>
      <Seg active={font === "xlarge"} onClick={() => update({ font: "xlarge" })} ariaLabel="Очень крупный шрифт">
        А++
      </Seg>

      <span className="a11y-sep" aria-hidden="true" />

      <span className="a11y-label">Цвет</span>
      <Seg active={scheme === "white"} onClick={() => update({ scheme: "white" })} ariaLabel="Чёрным по белому">
        Белый
      </Seg>
      <Seg active={scheme === "black"} onClick={() => update({ scheme: "black" })} ariaLabel="Белым по чёрному">
        Чёрный
      </Seg>
      <Seg active={scheme === "blue"} onClick={() => update({ scheme: "blue" })} ariaLabel="Тёмно-синим по голубому">
        Синий
      </Seg>

      <span className="a11y-sep" aria-hidden="true" />

      <span className="a11y-label">Интервал</span>
      <Seg active={spacing === "normal"} onClick={() => update({ spacing: "normal" })} ariaLabel="Обычный интервал">
        Обычный
      </Seg>
      <Seg active={spacing === "medium"} onClick={() => update({ spacing: "medium" })} ariaLabel="Средний интервал">
        Средний
      </Seg>
      <Seg active={spacing === "large"} onClick={() => update({ spacing: "large" })} ariaLabel="Большой интервал">
        Большой
      </Seg>

      <span className="a11y-sep" aria-hidden="true" />

      <span className="a11y-label">Изображения</span>
      <Seg active={images} onClick={() => update({ images: !images })} ariaLabel="Показ изображений">
        {images ? "Вкл" : "Выкл"}
      </Seg>

      <span className="a11y-sep" aria-hidden="true" />

      <span className="a11y-label">Засечки</span>
      <Seg active={serif} onClick={() => update({ serif: !serif })} ariaLabel="Шрифт с засечками">
        {serif ? "Да" : "Нет"}
      </Seg>

      <button
        type="button"
        className="a11y-seg a11y-exit"
        onClick={disable}
        data-testid="button-accessibility-off"
      >
        <X className="h-4 w-4" />
        Обычная версия
      </button>
    </div>
  );
}
