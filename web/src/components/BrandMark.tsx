type BrandMarkProps = {
  size?: number;
  className?: string;
  /** Цвет «волн». На светлых поверхностях — белый (фон), чтобы волны читались как прорези в кресте. */
  waveColor?: string;
};

/**
 * Фирменный знак ММЦ «Медео»: синий медицинский крест с тремя плавными
 * волнами (вода/поток/забота), идущими по диагонали в нижне-левой части.
 */
export function BrandMark({
  size = 34,
  className,
  waveColor = "#ffffff",
}: BrandMarkProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="23" y="4" width="18" height="56" rx="4.5" fill="#005eb8" />
      <rect x="4" y="23" width="56" height="18" rx="4.5" fill="#005eb8" />
      <g
        transform="rotate(-35 30 41)"
        stroke={waveColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M16 36 C 21 33 25 33 30 36 C 35 39 39 39 44 36" />
        <path d="M16 41 C 21 38 25 38 30 41 C 35 44 39 44 44 41" />
        <path d="M16 46 C 21 43 25 43 30 46 C 35 49 39 49 44 46" />
      </g>
    </svg>
  );
}
