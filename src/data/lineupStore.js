import { DEFAULT_ROTATIONS, ROLE_IDS, deriveSetter } from "./rotations";

const ENDPOINT = "https://crudcrud.com/api/0b2b31cc67d642c3aff700ed0ad8c6df/lineup";
const STORAGE_KEY = "voley-lineup-v2";

function isComplete(rotations) {
  return (
    Array.isArray(rotations) &&
    rotations.length === 6 &&
    rotations.every((rotation) =>
      ROLE_IDS.every((id) => {
        const spot = rotation.positions?.[id];
        return spot && Number.isFinite(Number(spot.x)) && Number.isFinite(Number(spot.y));
      }),
    )
  );
}

function normalize(rotations) {
  return rotations.map((rotation, index) => {
    const positions = Object.fromEntries(
      ROLE_IDS.map((id) => [
        id,
        { x: Number(rotation.positions[id].x), y: Number(rotation.positions[id].y) },
      ]),
    );
    return { id: index + 1, positions, setter: deriveSetter(positions) };
  });
}

async function request(url, options) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) return response;
      lastError = new Error("lineup");
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  throw lastError;
}

function readLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return isComplete(saved) ? normalize(saved) : null;
  } catch {
    return null;
  }
}

function writeLocal(rotations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rotations));
}

export function loadCachedLineup() {
  return readLocal() || DEFAULT_ROTATIONS;
}

export async function loadRemoteLineup() {
  const response = await request(ENDPOINT);
  if (!response.ok) throw new Error("lineup");
  const rows = await response.json();
  if (!Array.isArray(rows)) return null;
  const latest = rows
    .filter((row) => isComplete(row.rotations))
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
  if (!latest) return null;
  const rotations = normalize(latest.rotations);
  writeLocal(rotations);
  return rotations;
}

export async function saveLineup(rotations) {
  const list = await request(ENDPOINT);
  if (!list.ok) throw new Error("lineup");
  const rows = await list.json();
  const current = Array.isArray(rows)
    ? rows.filter((row) => row._id).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0]
    : null;
  const body = JSON.stringify({ rotations, savedAt: Math.floor(Date.now() / 1000) });
  const write = await request(current ? `${ENDPOINT}/${current._id}` : ENDPOINT, {
    method: current ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!write.ok) throw new Error("lineup");
  writeLocal(normalize(rotations));
}

export async function resetLineup() {
  const list = await request(ENDPOINT);
  if (!list.ok) throw new Error("lineup");
  const rows = await list.json();
  if (Array.isArray(rows)) {
    await Promise.all(
      rows
        .filter((row) => row._id)
        .map((row) => request(`${ENDPOINT}/${row._id}`, { method: "DELETE" })),
    );
  }
  localStorage.removeItem(STORAGE_KEY);
}
