const ENDPOINT = "https://crudcrud.com/api/c938941b7e4743a8be88242cf7e1cb4f/grades";
const PENDING_KEY = "voley-stats-pending-v1";

let flushing = false;

function readPending() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePending(entries) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
}

async function postGrade(entry) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: entry.mode,
      rotationId: entry.rotationId,
      nota: entry.nota,
    }),
  });
  if (!response.ok) throw new Error(`stats ${response.status}`);
}

async function flushGrades() {
  if (flushing) return;
  flushing = true;
  try {
    while (readPending().length) {
      const [entry] = readPending();
      await postGrade(entry);
      writePending(readPending().filter((item) => item.id !== entry.id));
    }
  } catch {
    /* the next resolve or the stats screen retries what is still pending */
  } finally {
    flushing = false;
  }
}

export function recordGrade({ mode, rotationId, nota }) {
  const pending = readPending();
  pending.push({
    id: crypto.randomUUID(),
    mode,
    rotationId,
    nota,
  });
  writePending(pending);
  void flushGrades();
}

export async function loadGrades() {
  await flushGrades();
  const response = await fetch(ENDPOINT);
  if (!response.ok) throw new Error(`stats ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      (row.mode === "focus" || row.mode === "hard") &&
      row.rotationId >= 1 &&
      row.rotationId <= 6 &&
      Number.isFinite(row.nota),
  );
}

function averageOf(rows) {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + row.nota, 0);
  return Math.round((total / rows.length) * 10) / 10;
}

export function summarize(rows, mode) {
  const mine = rows.filter((row) => row.mode === mode);
  return {
    count: mine.length,
    average: averageOf(mine),
    byRotation: [1, 2, 3, 4, 5, 6].map((id) => {
      const attempts = mine.filter((row) => row.rotationId === id);
      return { id, count: attempts.length, average: averageOf(attempts) };
    }),
  };
}
