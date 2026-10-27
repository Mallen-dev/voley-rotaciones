import { useEffect, useRef, useState } from "react";
import Court from "./Court";
import Chip from "./Chip";
import TopBar from "./TopBar";
import { ROLE_IDS, ROLES, deriveSetter, readCourtPoint, rotationName } from "../data/rotations";

export default function Admin({ rotations, onBack, onHelp, onSave, onReset }) {
  const [boards, setBoards] = useState(() => rotations.map((rotation) => ({ ...rotation.positions })));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null);
  const [status, setStatus] = useState("");

  const dragRef = useRef(null);
  const placeRef = useRef(() => {});
  const unplaceRef = useRef(() => {});
  const selectedRef = useRef(null);

  const positions = boards[index];
  const ready = boards.every((board) => ROLE_IDS.every((id) => board[id]));
  const benchRoles = ROLE_IDS.filter((id) => !positions[id]);

  function placeAt(roleId, point) {
    setBoards((prev) => prev.map((board, boardIndex) => (
      boardIndex === index ? { ...board, [roleId]: point } : board
    )));
    setSelected(null);
    setStatus("");
  }

  function unplace(roleId) {
    setBoards((prev) => prev.map((board, boardIndex) => {
      if (boardIndex !== index) return board;
      const next = { ...board };
      delete next[roleId];
      return next;
    }));
    setSelected(null);
    setStatus("");
  }

  placeRef.current = placeAt;
  unplaceRef.current = unplace;
  selectedRef.current = selected;

  useEffect(() => {
    function onMove(event) {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      const moved = current.moved || Math.hypot(event.clientX - current.sx, event.clientY - current.sy) > 8;
      current.moved = moved;
      current.x = event.clientX;
      current.y = event.clientY;
      if (moved) document.body.classList.add("is-dragging");
      setDrag({ role: current.role, x: event.clientX, y: event.clientY, moved });
    }

    function onUp(event) {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      dragRef.current = null;
      document.body.classList.remove("is-dragging");
      setDrag(null);
      if (!current.moved) {
        setSelected((value) => (value === current.role ? null : current.role));
        return;
      }
      const point = readCourtPoint(event.clientX, event.clientY);
      const under = document.elementFromPoint(event.clientX, event.clientY);
      if (point) placeRef.current(current.role, point);
      else if (under?.closest("[data-bench]")) unplaceRef.current(current.role);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.classList.remove("is-dragging");
    };
  }, []);

  function beginDrag(event, roleId) {
    dragRef.current = {
      role: roleId,
      pointerId: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      moved: false,
    };
    setDrag({ role: roleId, x: event.clientX, y: event.clientY, moved: false });
  }

  async function publish() {
    const next = boards.map((board, boardIndex) => ({
      id: boardIndex + 1,
      positions: board,
      setter: deriveSetter(board),
    }));
    setStatus("saving");
    try {
      await onSave(next);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  }

  const tokens = Object.entries(positions).map(([id, spot]) => ({
    id,
    role: id,
    x: spot.x,
    y: spot.y,
    selected: selected === id,
    lifted: drag?.role === id,
  }));

  return (
    <main className="screen">
      <TopBar title="Rotaciones" onBack={onBack} onHelp={onHelp} />
      <div className="game-layout">
        <section className="meta">
          <div className="rot-block">
            <p className="eyebrow">Solución de la rotación</p>
            <p className="rot-num">{rotationName(index + 1)}</p>
          </div>
          <div className="meta-copy">
            <p className="prompt">Coloca a los seis donde deben quedar. Esto es lo que se verá difuminado.</p>
            <div className="pips" aria-label="Rotaciones">
              {boards.map((board, boardIndex) => {
                const done = ROLE_IDS.every((id) => board[id]);
                const cls = [boardIndex === index ? "now" : "", done ? "ok" : ""].filter(Boolean).join(" ");
                return (
                  <button
                    key={boardIndex}
                    type="button"
                    className={`pip pip-btn ${cls}`}
                    onClick={() => setIndex(boardIndex)}
                    aria-label={rotationName(boardIndex + 1)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="stage">
          <Court
            tokens={tokens}
            interactive
            names={Object.fromEntries(ROLE_IDS.map((id) => [id, ROLES[id].name]))}
            onCourtClick={(event) => {
              if (!selectedRef.current) return;
              const point = readCourtPoint(event.clientX, event.clientY);
              if (point) placeAt(selectedRef.current, point);
            }}
            onChipPointerDown={beginDrag}
          />
          <div className="bench" data-bench>
            {benchRoles.map((id) => (
              <Chip
                key={id}
                role={id}
                name={ROLES[id].name}
                variant="bench"
                selected={selected === id}
                lifted={drag?.role === id}
                onPointerDown={beginDrag}
              />
            ))}
            {benchRoles.length === 0 ? <p className="bench-hint">Las seis están en el campo. Puedes moverlas.</p> : null}
          </div>
        </section>

        <section className="feedback-slot">
          {status === "saved" ? (
            <div className="feedback ok">
              <strong>Guardadas</strong>
              <p>El equipo verá estas posiciones al abrir la web.</p>
            </div>
          ) : null}
          {status === "failed" ? (
            <div className="feedback bad">
              <strong>No se han guardado</strong>
              <p>Prueba otra vez cuando tengas conexión.</p>
            </div>
          ) : null}
        </section>

        <section className="actions">
          <button type="button" className="btn btn-ghost" onClick={() => setBoards((prev) => prev.map((board, boardIndex) => (boardIndex === index ? {} : board)))}>
            Vaciar
          </button>
          <button type="button" className="btn btn-primary" disabled={!ready || status === "saving"} onClick={publish}>
            Usar estas rotaciones
          </button>
        </section>
      </div>
      {onReset ? (
        <button
          type="button"
          className="btn btn-quiet admin-reset"
          onClick={async () => {
            setStatus("saving");
            try {
              await onReset();
            } catch {
              setStatus("failed");
            }
          }}
        >
          Volver a las rotaciones de serie
        </button>
      ) : null}
      {drag?.moved ? (
        <div className="float-chip" style={{ left: drag.x, top: drag.y }}>
          <Chip role={drag.role} variant="float" />
        </div>
      ) : null}
    </main>
  );
}
