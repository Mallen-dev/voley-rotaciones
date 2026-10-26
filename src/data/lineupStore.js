import { DEFAULT_ROTATIONS, ROLE_IDS, deriveSetter } from "./rotations";

const STORAGE_KEY = "voley-lineup-v1";

function isComplete(rotations) {
  return (
    Array.isArray(rotations) &&
    rotations.length === 6 &&
    rotations.every((rotation) => ROLE_IDS.every((id) => rotation.positions?.[id]))
  );
}

export function encodeLineup(rotations) {
  const compact = rotations.map((rotation) =>
    ROLE_IDS.map((id) => [Math.round(rotation.positions[id].x), Math.round(rotation.positions[id].y)]),
  );
  return btoa(JSON.stringify(compact)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export function decodeLineup(code) {
  try {
    const padded = code.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (code.length % 4)) % 4);
    const compact = JSON.parse(atob(padded));
    if (!Array.isArray(compact) || compact.length !== 6) return null;
    const rotations = compact.map((spots, index) => {
      const positions = {};
      ROLE_IDS.forEach((id, spotIndex) => {
        const pair = spots[spotIndex];
        if (!pair) return;
        positions[id] = { x: Number(pair[0]), y: Number(pair[1]) };
      });
      return { id: index + 1, setter: deriveSetter(positions), positions };
    });
    return isComplete(rotations) ? rotations : null;
  } catch {
    return null;
  }
}

export function readHashLineup() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith("equipo=")) return null;
  return decodeLineup(hash.slice("equipo=".length));
}

export function lineupUrl(rotations) {
  const url = new URL(window.location.href);
  url.hash = `equipo=${encodeLineup(rotations)}`;
  return url.toString();
}

export function saveLineup(rotations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rotations));
  const url = new URL(window.location.href);
  url.hash = `equipo=${encodeLineup(rotations)}`;
  window.history.replaceState(null, "", url);
}

export function clearLineup() {
  localStorage.removeItem(STORAGE_KEY);
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url);
}

export function loadLineup() {
  const fromHash = readHashLineup();
  if (fromHash) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fromHash));
    return { rotations: fromHash, custom: true };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (isComplete(saved)) return { rotations: saved, custom: true };
  } catch {
    /* keep the built-in rotations */
  }
  return { rotations: DEFAULT_ROTATIONS, custom: false };
}
