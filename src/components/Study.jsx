import Court from "./Court";
import TopBar from "./TopBar";
import { ROTATIONS } from "../data/rotations";

export default function Study({ onBack, onHelp }) {
  return (
    <main className="screen study">
      <TopBar title="Las 6 rotaciones" onBack={onBack} onHelp={onHelp} />
      <p className="lede study-lede">
        Coloca el armador que está en red. El otro juega de opuesto. C es el central de delante
        y L el líbero, atrás.
      </p>
      <div className="study-grid">
        {ROTATIONS.map((rotation) => (
          <article key={rotation.id} className="study-card">
            <Court
              placements={rotation.slots}
              setter={rotation.setter}
              markSetter
              size="mini"
            />
            <div className="study-meta">
              <strong>Rotación {rotation.id}</strong>
              <span>
                Coloca <b className={`ink chip-${rotation.setter}`}>{rotation.setter}</b>
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
