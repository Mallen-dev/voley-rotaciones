import Chip from "./Chip";
import { ZONE_LABEL, ZONE_ORDER, isFront } from "../data/rotations";

export default function Court({
  placements = {},
  ghosts = {},
  zoneClass = {},
  hoverZone = null,
  selectedRole = null,
  draggingRole = null,
  setter = null,
  markSetter = false,
  size = "full",
  onZoneClick,
  onChipPointerDown,
  names = {},
}) {
  return (
    <div className={`court-wrap court-${size}`}>
      <div className="net" aria-hidden="true">
        <span className="antenna" />
        <span className="mesh">
          <span className="net-tag">RED</span>
        </span>
        <span className="antenna" />
      </div>
      <div className="court">
        <div className="attack-line" aria-hidden="true">
          <span>3 m</span>
        </div>
        <div className="zones">
          {ZONE_ORDER.map((zone) => {
            const role = placements[zone];
            const ghost = ghosts[zone];
            const state = [zoneClass[zone] || "", hoverZone === zone ? "hover" : ""]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={zone}
                className={`zone ${state} ${isFront(zone) ? "front" : "back"}`}
                data-zone={zone}
                onClick={() => onZoneClick?.(zone)}
              >
                <span className="zone-label">{ZONE_LABEL[zone]}</span>
                <div className="zone-stack">
                  {ghost ? <Chip role={ghost} variant="court" ghost /> : null}
                  {role ? (
                    <Chip
                      role={role}
                      name={names[role]}
                      variant="court"
                      selected={selectedRole === role}
                      lifted={draggingRole === role}
                      wrong={zoneClass[zone] === "wrong"}
                      setter={markSetter && role === setter}
                      onPointerDown={onChipPointerDown}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
