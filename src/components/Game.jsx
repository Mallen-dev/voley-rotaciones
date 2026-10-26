import { useEffect, useRef, useState } from "react";
import Court from "./Court";
import Chip from "./Chip";
import TopBar from "./TopBar";
import {
  ROLE_IDS,
  ROLES,
  ROTATIONS,
  ZONE_CENTER,
  explainRole,
  explainRotation,
  zoneAt,
  zoneOf,
} from "../data/rotations";

function randomIndex(except = -1) {
  const options = ROTATIONS.map((_, index) => index).filter((index) => index !== except);
  return options[Math.floor(Math.random() * options.length)];
}

function emptyPlacements() {
  return {};
}

export default function Game({ mode, role, onExit, onHelp, onHard, onPick }) {
  const focus = mode === "focus";
  const [order] = useState(() => ROTATIONS.map((_, index) => index));
  const [step, setStep] = useState(0);
  const [rotationIndex, setRotationIndex] = useState(() => (focus ? 0 : randomIndex()));
  const [positions, setPositions] = useState(emptyPlacements);
  const [resolved, setResolved] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lastOk, setLastOk] = useState(null);
  const [scored, setScored] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [tally, setTally] = useState({ ok: 0, total: 0 });
  const [phase, setPhase] = useState("play");
  const [drag, setDrag] = useState(null);

  const dragRef = useRef(null);
  const placeRef = useRef(() => {});
  const unplaceRef = useRef(() => {});
  const resolvedRef = useRef(false);
  const selectedRef = useRef(null);

  const rotation = focus ? ROTATIONS[order[step]] : ROTATIONS[rotationIndex];
  const placedIds = focus ? (positions[role] ? [role] : []) : ROLE_IDS.filter((id) => positions[id]);
  const canResolve = focus ? placedIds.length === 1 : placedIds.length === 6;
  const isLast = focus && step === order.length - 1;

  const benchRoles = focus
    ? positions[role]
      ? []
      : [role]
    : ROLE_IDS.filter((id) => !positions[id]);

  function courtPoint(clientX, clientY) {
    const court = document.querySelector("[data-court='true']");
    if (!court) return null;
    const rect = court.getBoundingClientRect();
    const inside =
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    if (!inside) return null;
    return {
      x: Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(90, Math.max(10, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  function placeAt(roleId, point) {
    if (resolvedRef.current) return;
    setPositions((prev) => ({ ...prev, [roleId]: point }));
    setSelected(null);
  }

  function unplace(roleId) {
    if (resolvedRef.current) return;
    setPositions((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
    setSelected(null);
  }

  placeRef.current = placeAt;
  unplaceRef.current = unplace;
  resolvedRef.current = resolved;
  selectedRef.current = selected;

  useEffect(() => {
    function onMove(event) {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      const moved =
        current.moved || Math.hypot(event.clientX - current.sx, event.clientY - current.sy) > 8;
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
      if (resolvedRef.current) return;
      if (!current.moved) {
        setSelected((value) => (value === current.role ? null : current.role));
        return;
      }
      const point = courtPoint(event.clientX, event.clientY);
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
    if (resolved) return;
    dragRef.current = {
      role: roleId,
      pointerId: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      moved: false,
    };
    setDrag({ role: roleId, x: event.clientX, y: event.clientY, moved: false });
  }

  function spotIsRight(id, board) {
    const spot = board[id];
    return Boolean(spot) && zoneAt(spot.x, spot.y) === zoneOf(rotation, id);
  }

  function boardIsCorrect(board = positions) {
    if (!focus) return ROLE_IDS.every((id) => spotIsRight(id, board));
    return spotIsRight(role, board);
  }

  function clearBoard() {
    setPositions(emptyPlacements());
    setResolved(false);
    setSelected(null);
    setLastOk(null);
  }

  function retry() {
    clearBoard();
  }

  function resolve() {
    if (!canResolve || resolved) return;
    const ok = boardIsCorrect();
    setLastOk(ok);
    setResolved(true);
    if (!scored) {
      setScored(true);
      if (focus) {
        setAttempts((prev) => [...prev, { rotationId: rotation.id, ok }]);
      } else {
        setTally((prev) => ({ ok: prev.ok + (ok ? 1 : 0), total: prev.total + 1 }));
      }
    }
  }

  function next() {
    if (focus && isLast) {
      setPhase("summary");
      return;
    }
    if (focus) setStep((value) => value + 1);
    else setRotationIndex((value) => randomIndex(value));
    setScored(false);
    clearBoard();
  }

  function replay() {
    setStep(0);
    setAttempts([]);
    setScored(false);
    setPhase("play");
    clearBoard();
  }

  const ghostRoles = resolved ? (focus ? [role] : ROLE_IDS) : [];
  const ghosts = ghostRoles.map((id) => {
    const spot = ZONE_CENTER[zoneOf(rotation, id)];
    return { id: `ghost-${id}`, role: id, x: spot.x, y: spot.y, ghost: true };
  });
  const tokens = Object.entries(positions).map(([id, spot]) => ({
    id,
    role: id,
    x: spot.x,
    y: spot.y,
    selected: selected === id,
    lifted: drag?.role === id,
    right: resolved && zoneAt(spot.x, spot.y) === zoneOf(rotation, id),
    wrong: resolved && zoneAt(spot.x, spot.y) !== zoneOf(rotation, id),
  }));

  const correctCount = focus
    ? lastOk
      ? 1
      : 0
    : ROLE_IDS.filter((id) => spotIsRight(id, positions)).length;

  const title = focus ? ROLES[role].name : "Nivel difícil";
  const prompt = focus
    ? `Eres ${ROLES[role].name}. Arrástralo a su sitio.`
    : "Arrastra a los seis por el campo.";

  const why = focus ? explainRole(rotation, role) : explainRotation(rotation);
  const firstTry = focus ? attempts[step] : null;
  const fixedAfterMiss = Boolean(firstTry && !firstTry.ok && lastOk);

  if (phase === "summary") {
    const hits = attempts.filter((item) => item.ok).length;
    return (
      <main className="screen">
        <TopBar title="Resultado" onBack={onExit} onHelp={onHelp} />
        <section className="summary">
          <p className="eyebrow">A la primera</p>
          <p className="score">
            {hits}
            <span>/{attempts.length}</span>
          </p>
          <p className="lede">
            {hits === attempts.length
              ? "Las seis clavadas. Puedes pasar al nivel difícil."
              : "El primer intento es el que cuenta. Las rojas son las que hay que repasar."}
          </p>
          <div className="result-row">
            {attempts.map((item) => (
              <div key={item.rotationId} className={`result-pip ${item.ok ? "ok" : "bad"}`}>
                <strong>{item.rotationId}</strong>
                <span>{item.ok ? "Bien" : "Mal"}</span>
              </div>
            ))}
          </div>
          <div className="summary-actions">
            <button type="button" className="btn btn-primary" onClick={replay}>
              Otra vez
            </button>
            {hits === attempts.length ? (
              <button type="button" className="btn btn-ghost" onClick={onHard}>
                Nivel difícil
              </button>
            ) : null}
            <button type="button" className="btn btn-ghost" onClick={onPick}>
              Cambiar de puesto
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="screen game-screen">
      <TopBar title={title} onBack={onExit} onHelp={onHelp} />
      <div className="game-layout">
        <section className="meta">
          <div className="rot-block">
            <p className="eyebrow">Recepción · saca el rival</p>
            <p className="rot-num">{rotation.id}</p>
          </div>
          <div className="meta-copy">
            <p className="rot-label">Rotación {rotation.id}</p>
            <p className="prompt">{prompt}</p>
            {focus ? (
              <div className="pips" aria-label="Progreso">
                {order.map((_, index) => {
                  const attempt = attempts[index];
                  const cls = [
                    index === step ? "now" : "",
                    attempt ? (attempt.ok ? "ok" : "bad") : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return <span key={index} className={`pip ${cls}`} />;
                })}
              </div>
            ) : (
              <p className="tally">
                A la primera: {tally.ok}/{tally.total}
              </p>
            )}
            {selected && !resolved ? <p className="hint">Toca el campo donde va.</p> : null}
          </div>
        </section>

        <section className="stage">
          <Court
            tokens={tokens}
            ghosts={ghosts}
            interactive
            names={Object.fromEntries(ROLE_IDS.map((id) => [id, ROLES[id].name]))}
            onCourtClick={(event) => {
              if (resolved || !selectedRef.current) return;
              const point = courtPoint(event.clientX, event.clientY);
              if (point) placeAt(selectedRef.current, point);
            }}
            onChipPointerDown={beginDrag}
          />
          {resolved ? <p className="ghost-note">En difuminado, la posición exacta.</p> : null}
          {benchRoles.length > 0 || !resolved ? (
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
              {benchRoles.length === 0 ? (
                <p className="bench-hint">
                  {focus ? "Tu ficha está en el campo. Puedes moverla." : "Los seis están en el campo."}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="feedback-slot">
          {resolved ? (
            <div className={`feedback ${lastOk ? "ok" : "bad"}`}>
              <strong>
                {focus
                  ? lastOk
                    ? fixedAfterMiss
                      ? "Ahora sí"
                      : "Bien"
                    : "Mal"
                  : lastOk
                    ? "Bien"
                    : `${correctCount} de 6`}
              </strong>
              <p>
                {fixedAfterMiss
                  ? "El primer intento contaba como fallo."
                  : "La ficha difuminada marca el sitio justo."}
              </p>
              <details className="why" open={!lastOk || fixedAfterMiss}>
                <summary>¿Por qué?</summary>
                <p>{why}</p>
              </details>
            </div>
          ) : null}
        </section>

        <section className="actions">
          {!resolved ? (
            <button type="button" className="btn btn-primary" disabled={!canResolve} onClick={resolve}>
              Resolver
            </button>
          ) : (
            <>
              {!lastOk || fixedAfterMiss ? (
                <button type="button" className="btn btn-ghost" onClick={retry}>
                  Reintentar
                </button>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={next}>
                {focus ? (isLast ? "Ver resultado" : "Siguiente") : "Otra rotación"}
              </button>
            </>
          )}
        </section>
      </div>

      {drag?.moved ? (
        <div className="float-chip" style={{ left: drag.x, top: drag.y }}>
          <Chip role={drag.role} variant="float" />
        </div>
      ) : null}
    </main>
  );
}
