import { useRef } from "react";
import Court from "./Court";
import { ROLES, rotationName, tokensFor } from "../data/rotations";

function Ball() {
  return (
    <svg className="ball" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#f5c400" />
      <path d="M32 3c7 9 8 18 0 29 8 11 7 20 0 29" fill="none" stroke="#1a1404" strokeWidth="3" />
      <path d="M4 32c10-7 19-8 28 0 9 8 18 7 28 0" fill="none" stroke="#1a1404" strokeWidth="3" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#1a1404" strokeWidth="3" />
    </svg>
  );
}

export default function Home({ rotation, onTrain, onHard, onStudy, onCoach, onHelp }) {
  const sample = rotation;
  const hold = useRef(0);

  function startHold() {
    window.clearTimeout(hold.current);
    hold.current = window.setTimeout(onCoach, 700);
  }

  function cancelHold() {
    window.clearTimeout(hold.current);
  }

  return (
    <main className="screen home">
      <div className="home-top">
        <p className="eyebrow">Recepción · sistema 4-2</p>
        <button type="button" className="icon-btn" onClick={onHelp} aria-label="Explicación">
          ?
        </button>
      </div>

      <div className="home-inner">
        <header className="home-copy">
          <Ball />
          <h1
            className="hero-title"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onContextMenu={(event) => event.preventDefault()}
          >
            Rotaciones
          </h1>
          <p className="lede">
            Aprende dónde te pones en cada rotación. Funciona en el móvil y en el ordenador.
          </p>
        </header>

        <div className="home-court">
          <Court tokens={tokensFor(sample)} size="hero" />
          <p className="court-caption">
            {rotationName(sample.id)} · coloca <strong>{ROLES[sample.setter].name}</strong>
          </p>
          <p className="court-note">Red arriba. La línea de 3 m separa las dos filas.</p>
        </div>

        <div className="home-actions">
          <button type="button" className="mode-card" onClick={onTrain}>
            <span className="mode-kicker">Entrenar</span>
            <strong>Mi puesto</strong>
            <span>Armador, central, líbero o receptor. Si hay delantero y trasero, colocas los dos.</span>
          </button>
          <button type="button" className="mode-card mode-hard" onClick={onHard}>
            <span className="mode-kicker">Reto</span>
            <strong>Nivel difícil</strong>
            <span>Una rotación al azar. Hay que colocar a los seis.</span>
          </button>
          <button type="button" className="btn btn-ghost wide" onClick={onStudy}>
            Ver las 6 rotaciones
          </button>
        </div>
      </div>
    </main>
  );
}
