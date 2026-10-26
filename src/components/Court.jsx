import Chip from "./Chip";
import { slotsToTokens } from "../data/rotations";

export default function Court({
  slots = null,
  tokens = [],
  ghosts = [],
  setter = null,
  markSetter = false,
  size = "full",
  interactive = false,
  names = {},
  onCourtClick,
  onChipPointerDown,
}) {
  const fixed = slots ? slotsToTokens(slots, markSetter ? setter : null) : [];
  const drawn = [...ghosts, ...(slots ? fixed : tokens)];

  return (
    <div className={`court-wrap court-${size}`}>
      <div className="net" aria-hidden="true">
        <span className="antenna" />
        <span className="mesh">
          <span className="net-tag">RED</span>
        </span>
        <span className="antenna" />
      </div>
      <div
        className="court"
        data-court={interactive ? "true" : undefined}
        onClick={(event) => {
          if (event.target.closest(".chip")) return;
          onCourtClick?.(event);
        }}
      >
        <div className="attack-line" aria-hidden="true">
          <span>3 m</span>
        </div>
        <span className="row-label row-front">Delantero</span>
        <span className="row-label row-back">Trasero</span>
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
