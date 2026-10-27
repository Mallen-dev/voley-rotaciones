import { useId } from "react";
import Chip from "./Chip";

export default function Court({
  tokens = [],
  ghosts = [],
  size = "full",
  interactive = false,
  names = {},
  onCourtClick,
  onChipPointerDown,
}) {
  const drawn = [...ghosts, ...tokens];
  const uid = useId().replace(/:/g, "");
  const mesh = `mesh-${uid}`;
  const post = `post-${uid}`;
  const stripes = `stripes-${uid}`;

  return (
    <div className={`court-wrap court-${size}`}>
      <svg className="net-svg" viewBox="0 -80 1100 335" aria-hidden="true">
        <defs>
          <pattern id={mesh} width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#1c1c1c" />
            <path d="M10 0 H0 V10" fill="none" stroke="#d5d5d5" strokeWidth="0.7" />
          </pattern>
          <linearGradient id={post} x1="0" x2="1">
            <stop offset="0" stopColor="#3a3a3a" />
            <stop offset="0.42" stopColor="#f3f3f3" />
            <stop offset="1" stopColor="#222" />
          </linearGradient>
          <pattern id={stripes} width="4" height="10" patternUnits="userSpaceOnUse">
            <rect width="4" height="5" fill="#fff" />
            <rect y="5" width="4" height="5" fill="#d40000" />
          </pattern>
        </defs>
        <rect x="36" y="0" width="14" height="255" rx="6" fill={`url(#${post})`} />
        <rect x="1050" y="0" width="14" height="255" rx="6" fill={`url(#${post})`} />
        <rect x="43" y="12" width="1014" height="100" fill={`url(#${mesh})`} />
        <rect x="43" y="12" width="1014" height="7" fill="#f7f7f7" />
        <rect x="43" y="106" width="1014" height="6" fill="#efefef" />
        <rect x="97" y="12" width="7" height="100" fill="#fff" />
        <rect x="996" y="12" width="7" height="100" fill="#fff" />
        <rect x="93" y="-68" width="4" height="180" fill={`url(#${stripes})`} />
        <rect x="1003" y="-68" width="4" height="180" fill={`url(#${stripes})`} />
      </svg>
      <div
        className="court"
        data-court={interactive ? "true" : undefined}
        onClick={(event) => {
          if (event.target.closest(".chip")) return;
          onCourtClick?.(event);
        }}
      >
        <div className="floor" aria-hidden="true" />
        <div className="court-lines" aria-hidden="true">
          <span className="boundary" />
          <span className="attack-line">
            <span>3 m</span>
          </span>
        </div>
        {drawn.map((token) => (
          <div
            key={token.id || `${token.ghost ? "ghost" : "live"}-${token.role}`}
            className={`token ${token.ghost ? "is-ghost" : ""}`}
            style={{ left: `${token.x}%`, top: `${token.y}%` }}
          >
            <Chip
              role={token.role}
              name={names[token.role]}
              variant="court"
              ghost={Boolean(token.ghost)}
              selected={Boolean(token.selected)}
              lifted={Boolean(token.lifted)}
              wrong={Boolean(token.wrong)}
              right={Boolean(token.right)}
              setter={Boolean(token.setter)}
              onPointerDown={token.ghost ? undefined : onChipPointerDown}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
