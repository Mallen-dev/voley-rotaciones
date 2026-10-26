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
