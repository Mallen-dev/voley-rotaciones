import { useEffect, useState } from "react";
import TopBar from "./TopBar";
import { loadGrades, summarize } from "../data/statsStore";

function attemptsLabel(count) {
  return `${count} ${count === 1 ? "intento" : "intentos"}`;
}

function formatAverage(value) {
  return value == null ? "—" : value.toFixed(1);
}

function Block({ title, summary }) {
  return (
    <section className="stats-block">
      <h2>{title}</h2>
      <p className="stats-general">
        {summary.count
          ? `${attemptsLabel(summary.count)} · nota media ${formatAverage(summary.average)}`
          : "Todavía no hay intentos."}
      </p>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Rotación</th>
            <th>Intentos</th>
            <th>Nota media</th>
          </tr>
        </thead>
        <tbody>
          {summary.byRotation.map((row) => (
            <tr key={row.id}>
              <th>{`R${row.id}`}</th>
              <td>{row.count}</td>
              <td>{formatAverage(row.average)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function Stats({ onBack, onHelp, onAdmin }) {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadGrades()
      .then((next) => {
        if (alive) setRows(next);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="screen">
      <TopBar title="Estadísticas" onBack={onBack} onHelp={onHelp} onTitleHold={onAdmin} />
      {failed ? <p className="lede">No se han podido cargar las estadísticas.</p> : null}
      {rows ? (
        <>
          <Block title="Mi puesto" summary={summarize(rows, "focus")} />
          <Block title="Nivel difícil" summary={summarize(rows, "hard")} />
        </>
      ) : null}
      {!rows && !failed ? <p className="lede">Cargando…</p> : null}
    </main>
  );
}
