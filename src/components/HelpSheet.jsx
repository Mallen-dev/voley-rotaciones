import { useEffect } from "react";

export default function HelpSheet({ onClose }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <h2 id="help-title">Cómo funciona</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <h3>Quién coloca</h3>
        <p>
          Hay dos armadores, A1 y A2, uno enfrente del otro. Coloca el que está en la red,
          en las zonas 4, 3 o 2. El que se queda atrás juega de opuesto.
        </p>
        <p>A1 coloca en las rotaciones 1, 5 y 6. A2 coloca en las 2, 3 y 4, cuando sube a red.</p>

        <h3>Recepción</h3>
        <p>
          En recepción siempre se ve un central (C) delante y el líbero (L) en el sitio del
          central de atrás. R1 y R2 son los receptores.
        </p>
        <p>
          Esto es recepción: saca el otro equipo. La zona 1 es atrás a la derecha, no es tu saque.
          Si a tu central le toca sacar, sale el líbero y entra el central. Eso no se entrena aquí.
        </p>

        <h3>El campo</h3>
        <p>La red está arriba. Delante: 4, 3 y 2. Atrás: 5, 6 y 1. La línea de 3 metros separa las dos filas.</p>

        <h3>Cómo se juega</h3>
        <p>
          Arrastra la ficha hasta su zona. También puedes tocarla y después tocar la zona.
          Resolver marca bien o mal y deja, difuminada, la posición exacta.
        </p>
        <p>Si fallas, ¿Por qué? explica esa rotación. El cuadro de las seis está en Ver las 6.</p>
      </section>
    </div>
  );
}
