import { useRef } from "react";

export default function TopBar({ title, onBack, onHelp, onTitleHold, backLabel = "Inicio" }) {
  const hold = useRef(0);

  function startHold() {
    if (!onTitleHold) return;
    window.clearTimeout(hold.current);
    hold.current = window.setTimeout(onTitleHold, 700);
  }

  function cancelHold() {
    window.clearTimeout(hold.current);
  }

  return (
    <header className="topbar">
      <button type="button" className="btn btn-quiet" onClick={onBack}>
        {backLabel}
      </button>
      <h1
        className={onTitleHold ? "is-hold" : undefined}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={onTitleHold ? (event) => event.preventDefault() : undefined}
      >
        {title}
      </h1>
      <button type="button" className="icon-btn" onClick={onHelp} aria-label="Explicación">
        ?
      </button>
    </header>
  );
}
