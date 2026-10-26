export default function TopBar({ title, onBack, onHelp, backLabel = "Inicio" }) {
  return (
    <header className="topbar">
      <button type="button" className="btn btn-quiet" onClick={onBack}>
        {backLabel}
      </button>
      <h1>{title}</h1>
      <button type="button" className="icon-btn" onClick={onHelp} aria-label="Explicación">
        ?
      </button>
    </header>
  );
}
