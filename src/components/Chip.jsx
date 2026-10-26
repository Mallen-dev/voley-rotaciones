export default function Chip({
  role,
  name,
  variant = "court",
  selected = false,
  lifted = false,
  ghost = false,
  wrong = false,
  right = false,
  setter = false,
  onPointerDown,
}) {
  const className = [
    "chip",
    `chip-${role}`,
    `chip-${variant}`,
    selected ? "is-selected" : "",
    lifted ? "is-lifted" : "",
    ghost ? "is-ghost" : "",
    wrong ? "is-wrong" : "",
    right ? "is-right" : "",
    setter ? "is-setter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = name ? `${name} (${role})` : role;
  const content = (
    <>
      <span className="chip-face">
        <span className="chip-id">{role}</span>
      </span>
      {variant === "bench" && name ? <span className="chip-name">{name}</span> : null}
    </>
  );

  if (!onPointerDown) {
    return (
      <div className={className} aria-hidden={ghost ? true : undefined}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={selected}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown(event, role);
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </button>
  );
}
