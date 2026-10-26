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
          Hay dos armadores, el armador delantero (AD) y el armador trasero (AT), uno enfrente
          del otro. Coloca el que está en la fila delantera, junto a la red. El que se queda
          en la trasera juega de opuesto.
        </p>

        <h3>Recepción</h3>
        <p>
          En recepción siempre se ve un central (C) delante y el líbero (L) en el sitio del
          central de atrás. RD es el receptor delantero y RT el receptor trasero. Las rotaciones
          se llaman R1, R2, R3, R4, R5 y R6.
        </p>
        <p>
          Esto es recepción: saca el otro equipo. La fila trasera no es el saque.
          Si a tu central le toca sacar, sale el líbero y entra el central. Eso no se entrena aquí.
        </p>

        <h3>El campo</h3>
        <p>
          La red está arriba. La fila de arriba es la delantera y la de abajo, la trasera.
          La línea de 3 metros las separa. Arrastra la ficha a cualquier punto del campo.
        </p>

        <h3>Cómo se juega</h3>
        <p>
          Arrastra la ficha por todo el campo. También puedes tocarla y después tocar el sitio.
          Resolver marca bien o mal y deja, difuminada, la posición exacta.
        </p>
        <p>Si fallas, ¿Por qué? explica esa rotación. El cuadro de las seis está en Ver las 6.</p>
      </section>
    </div>
  );
}
