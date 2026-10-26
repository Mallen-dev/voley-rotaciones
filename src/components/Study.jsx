import Court from "./Court";
import TopBar from "./TopBar";
import { ROLES, rotationName, tokensFor } from "../data/rotations";

export default function Study({ rotations, onBack, onHelp }) {
  return (
    <main className="screen study">
      <TopBar title="Las 6 rotaciones" onBack={onBack} onHelp={onHelp} />
      <p className="lede study-lede">
        Coloca el armador que está en red: el delantero (AD) o el trasero (AT). C es el central
        de delante y L el líbero, atrás.
      </p>
      <div className="study-grid">
        {rotations.map((rotation) => (
          <article key={rotation.id} className="study-card">
            <Court tokens={tokensFor(rotation)} size="mini" />
            <div className="study-meta">
              <strong>{rotationName(rotation.id)}</strong>
              <span>
                Coloca <b className={`ink chip-${rotation.setter}`}>{ROLES[rotation.setter].name}</b>
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
