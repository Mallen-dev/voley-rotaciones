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
        <span className="post" />
        <span className="net-body">
          <span className="antenna antenna-left" />
          <span className="antenna antenna-right" />
          <span className="tape" />
          <span className="mesh" />
          <span className="tape tape-low" />
        </span>
        <span className="post" />
      </div>
      <div
        className="court"
        data-court={interactive ? "true" : undefined}
        onClick={(event) => {
          if (event.target.closest(".chip")) return;
          onCourtClick?.(event);
        }}
      >
        <div className="wood" aria-hidden="true" />
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
