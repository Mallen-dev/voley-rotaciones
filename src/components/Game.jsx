import { useEffect, useRef, useState } from "react";
import Court from "./Court";
import Chip from "./Chip";
import TopBar from "./TopBar";
import {
  ROLE_IDS,
  ROLES,
  boardMatch,
  explainPost,
  explainRotation,
  formatClock,
  gradeFrom,
  gradeLabel,
  postById,
  readCourtPoint,
  targetSeconds,
  zoneAt,
  zoneOf,
} from "../data/rotations";

function randomIndex(total, except = -1) {
  const options = Array.from({ length: total }, (_, index) => index).filter((index) => index !== except);
  return options[Math.floor(Math.random() * options.length)];
}

function emptyPlacements() {
  return {};
}

function promptFor(duties) {
  if (duties.length > 2) return "Arrastra a los seis por el campo.";
  if (duties.length === 2) {
    const [front, back] = duties.map((id) => ROLES[id].name.toLowerCase());
    return `Coloca al ${front} y al ${back}.`;
  }
  return `Eres ${ROLES[duties[0]].name}. Arrástralo a su sitio.`;
}

export default function Game({ mode, post, rotations, onExit, onHelp, onHard, onPick }) {
  const focus = mode === "focus";
  const duties = focus ? postById(post).roles : ROLE_IDS;
  const [order] = useState(() => rotations.map((_, index) => index));
  const [step, setStep] = useState(0);
  const [rotationIndex, setRotationIndex] = useState(() => (focus ? 0 : randomIndex(rotations.length)));
  const [positions, setPositions] = useState(emptyPlacements);
  const [resolved, setResolved] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lastOk, setLastOk] = useState(null);
  const [scored, setScored] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [mark, setMark] = useState(null);
  const [phase, setPhase] = useState("play");
  const [drag, setDrag] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const dragRef = useRef(null);
  const placeRef = useRef(() => {});
  const unplaceRef = useRef(() => {});
  const resolvedRef = useRef(false);
  const selectedRef = useRef(null);
  const clockRef = useRef(null);
  const sliceRef = useRef(0);

  const rotation = focus ? rotations[order[step]] : rotations[rotationIndex];
  const placedIds = duties.filter((id) => positions[id]);
  const canResolve = placedIds.length === duties.length;
  const isLast = focus && step === order.length - 1;
  const benchRoles = duties.filter((id) => !positions[id]);

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
    const clock = { running: true, started: performance.now(), bank: 0 };
    clockRef.current = clock;
    const id = window.setInterval(() => {
      const current = clockRef.current;
      if (!current?.running) return;
      setElapsed(current.bank + performance.now() - current.started);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

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

  function pauseClock() {
    const clock = clockRef.current;
    if (!clock?.running) return clock?.bank ?? 0;
    clock.bank += performance.now() - clock.started;
    clock.running = false;
    setElapsed(clock.bank);
    return clock.bank;
  }

  function resumeClock() {
    const clock = clockRef.current;
    if (!clock || clock.running) return;
    clock.started = performance.now();
    clock.running = true;
  }

  function resetClock() {
    clockRef.current = { running: true, started: performance.now(), bank: 0 };
    sliceRef.current = 0;
    setElapsed(0);
  }

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
    return duties.every((id) => spotIsRight(id, board));
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
    const bank = pauseClock();
    setLastOk(ok);
    setResolved(true);
    if (!scored) {
      const seconds = Math.max(0, (bank - sliceRef.current) / 1000);
      const match = boardMatch(rotation, positions, duties);
      const nota = gradeFrom(match, seconds, duties.length);
      const entry = { rotationId: rotation.id, ok, match, seconds, nota };
      setMark(entry);
      setScored(true);
      setAttempts((prev) => [...prev, entry]);
    }
  }

  function next() {
    if (focus && isLast) {
      pauseClock();
      setPhase("summary");
      return;
    }
    if (focus) {
      sliceRef.current = clockRef.current?.bank ?? 0;
      setStep((value) => value + 1);
      resumeClock();
    } else {
      setRotationIndex((value) => randomIndex(rotations.length, value));
      resetClock();
    }
    setScored(false);
    setMark(null);
    clearBoard();
  }

  function replay() {
    setStep(0);
    setAttempts([]);
    setMark(null);
    setScored(false);
    setPhase("play");
    resetClock();
    clearBoard();
  }

  const ghosts = (resolved ? duties : []).map((id) => {
    const spot = rotation.positions[id];
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

  const correctCount = duties.filter((id) => spotIsRight(id, positions)).length;
  const title = focus ? postById(post).name : "Nivel difícil";
  const prompt = promptFor(duties);
  const why = focus ? explainPost(rotation, duties) : explainRotation(rotation);
  const firstTry = focus ? attempts[step] : attempts[attempts.length - 1];
  const fixedAfterMiss = Boolean(firstTry && !firstTry.ok && lastOk && scored);
  const shownMark = mark || (scored ? firstTry : null);

  if (phase === "summary") {
    const chipCount = duties.length * attempts.length;
    const totalSeconds = attempts.reduce((sum, item) => sum + item.seconds, 0);
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, item) => sum + item.match, 0) / attempts.length)
      : 0;
    const nota = gradeFrom(average, totalSeconds, chipCount);
    const hits = attempts.filter((item) => item.ok).length;
    return (
      <main className="screen">
        <TopBar title="Resultado" onBack={onExit} onHelp={onHelp} />
        <section className="summary">
          <p className="eyebrow">{gradeLabel(nota)}</p>
          <p className="score">{nota.toFixed(1)}</p>
          <div className="grade-stats">
            <span>Coincidencia {average}%</span>
            <span>Tiempo {formatClock(totalSeconds * 1000)}</span>
            <span>Referencia {formatClock(targetSeconds(chipCount) * 1000)}</span>
          </div>
          <p className="lede">
            {`La nota sale de lo cerca que queda cada ficha de la solución. 100% es encima. A la primera, la zona correcta en ${hits} de ${attempts.length}.`}
          </p>
          <div className="result-row">
            {attempts.map((item) => (
              <div key={item.rotationId} className={`result-pip ${item.ok ? "ok" : "bad"}`}>
                <strong>{`R${item.rotationId}`}</strong>
                <span>{item.match}%</span>
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

  const hardAverage = attempts.length
    ? (attempts.reduce((sum, item) => sum + item.nota, 0) / attempts.length).toFixed(1)
    : null;
  const zoneNote = fixedAfterMiss
    ? "La zona ya cuadra. La nota es la del primer intento."
    : lastOk
      ? focus
        ? "Zona correcta. 100% es encima de la ficha difuminada."
        : `Zona correcta en ${correctCount} de 6. 100% es encima de la ficha difuminada.`
      : focus
        ? "Fuera de la zona. 100% es encima de la ficha difuminada."
        : `Zona correcta en ${correctCount} de 6. 100% es encima de la ficha difuminada.`;

  return (
    <main className="screen game-screen">
      <TopBar title={title} onBack={onExit} onHelp={onHelp} />
      <div className="game-layout">
        <section className="meta">
          <div className="rot-block">
            <div>
              <p className="eyebrow">Recepción · saca el rival</p>
              <p className={`clock ${resolved ? "is-paused" : ""}`}>{formatClock(elapsed)}</p>
            </div>
            <p className="rot-num">{`R${rotation.id}`}</p>
          </div>
          <div className="meta-copy">
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
              <p className="tally">{hardAverage ? `Nota media ${hardAverage}` : "Primera rotación"}</p>
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
              const point = readCourtPoint(event.clientX, event.clientY);
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
                  {duties.length > 1
                    ? "Tus fichas están en el campo. Puedes moverlas."
                    : "Tu ficha está en el campo. Puedes moverla."}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="feedback-slot">
          {resolved && shownMark ? (
            <div className={`feedback ${shownMark.nota >= 5 ? "ok" : "bad"}`}>
              <strong>{`${shownMark.nota.toFixed(1)} ${gradeLabel(shownMark.nota)}`}</strong>
              <p className="grade-line">{`Coincidencia ${shownMark.match}%`}</p>
              <p>{zoneNote}</p>
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
