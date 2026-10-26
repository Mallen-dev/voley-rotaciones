import TopBar from "./TopBar";
import { ROLE_IDS, ROLES } from "../data/rotations";

export default function RoleSelect({ onBack, onHelp, onChoose }) {
  return (
    <main className="screen">
      <TopBar title="Elige tu puesto" onBack={onBack} onHelp={onHelp} />
      <p className="lede pick-lede">Toca la ficha que quieres entrenar. Luego irán saliendo las 6 rotaciones.</p>
      <div className="role-grid">
        {ROLE_IDS.map((id) => {
          const role = ROLES[id];
          return (
            <button key={id} type="button" className="role-card" onClick={() => onChoose(id)}>
              <span className={`jersey chip-${id}`}>{id}</span>
              <span className="role-copy">
                <strong>{role.name}</strong>
                <small>{role.hint}</small>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
