export const ROLE_IDS = ["AD", "AT", "C", "L", "RD", "RT"];
const SETTER_IDS = ["AD", "AT"];

export const POSTS = [
  { id: "armador", name: "Armador", hint: "Delantero y trasero", roles: ["AD", "AT"] },
  { id: "central", name: "Central", hint: "El central de la red", roles: ["C"] },
  { id: "libero", name: "Líbero", hint: "El líbero, atrás", roles: ["L"] },
  { id: "receptor", name: "Receptor", hint: "Delantero y trasero", roles: ["RD", "RT"] },
];

export function postById(id) {
  return POSTS.find((post) => post.id === id) || POSTS[0];
}

const MATCH_REACH = 28;
const SECONDS_PER_CHIP = 12;

export function spotMatch(guess, answer) {
  if (!guess || !answer) return 0;
  const distance = Math.hypot(guess.x - answer.x, guess.y - answer.y);
  return Math.max(0, Math.min(100, Math.round(100 * (1 - distance / MATCH_REACH))));
}

export function boardMatch(rotation, board, roles) {
  if (!roles.length) return 0;
  const total = roles.reduce((sum, id) => sum + spotMatch(board[id], rotation.positions[id]), 0);
  return Math.round(total / roles.length);
}

export function targetSeconds(chipCount) {
  return Math.max(1, chipCount) * SECONDS_PER_CHIP;
}

export function gradeFrom(match, seconds, chipCount) {
  const target = targetSeconds(chipCount);
  const overtime = Math.max(0, seconds - target);
  const penalty = Math.min(2.5, (overtime / target) * 2.5);
  const nota = Math.max(0, match / 10 - penalty);
  return Math.round(nota * 10) / 10;
}

export function gradeLabel(nota) {
  if (nota >= 9) return "Sobresaliente";
  if (nota >= 7) return "Notable";
  if (nota >= 6) return "Bien";
  if (nota >= 5) return "Suficiente";
  return "Insuficiente";
}

export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function rotationName(id) {
  return `R${id}`;
}

export const ROLES = {
  AD: {
    id: "AD",
    name: "Armador delantero",
    hint: "Coloca cuando está delante",
  },
  AT: {
    id: "AT",
    name: "Armador trasero",
    hint: "Coloca cuando sube a la red",
  },
  C: {
    id: "C",
    name: "Central",
    hint: "El central de la red",
  },
  L: {
    id: "L",
    name: "Líbero",
    hint: "Entra por el central de atrás",
  },
  RD: {
    id: "RD",
    name: "Receptor delantero",
    hint: "Receptor que sale delante",
  },
  RT: {
    id: "RT",
    name: "Receptor trasero",
    hint: "Receptor que sale atrás",
  },
};

export const ZONE_ORDER = ["z4", "z3", "z2", "z5", "z6", "z1"];

export const ZONE_LABEL = {
  z4: "delantero, a la izquierda",
  z3: "delantero, en el centro",
  z2: "delantero, a la derecha",
  z5: "trasero, a la izquierda",
  z6: "trasero, en el centro",
  z1: "trasero, a la derecha",
};

export const ZONE_CENTER = {
  z4: { x: 17, y: 20 },
  z3: { x: 50, y: 20 },
  z2: { x: 83, y: 20 },
  z5: { x: 17, y: 70 },
  z6: { x: 50, y: 70 },
  z1: { x: 83, y: 70 },
};

const RAW_ROTATIONS = [
  { id: 1, setter: "AD", slots: { z4: "RD", z3: "C", z2: "AD", z5: "AT", z6: "L", z1: "RT" } },
  { id: 2, setter: "AT", slots: { z4: "AT", z3: "RD", z2: "C", z5: "L", z6: "RT", z1: "AD" } },
  { id: 3, setter: "AT", slots: { z4: "C", z3: "AT", z2: "RD", z5: "RT", z6: "AD", z1: "L" } },
  { id: 4, setter: "AT", slots: { z4: "RT", z3: "C", z2: "AT", z5: "AD", z6: "L", z1: "RD" } },
  { id: 5, setter: "AD", slots: { z4: "AD", z3: "RT", z2: "C", z5: "L", z6: "RD", z1: "AT" } },
  { id: 6, setter: "AD", slots: { z4: "C", z3: "AD", z2: "RT", z5: "RD", z6: "AT", z1: "L" } },
];

export function zoneAt(x, y) {
  const column = x < 100 / 3 ? 0 : x < 200 / 3 ? 1 : 2;
  const row = y < 37.5 ? ["z4", "z3", "z2"] : ["z5", "z6", "z1"];
  return row[column];
}

export function deriveSetter(positions) {
  const setters = SETTER_IDS.filter((id) => positions[id]);
  const front = setters.filter((id) => positions[id].y < 37.5);
  const pool = front.length ? front : setters;
  return pool.sort((a, b) => positions[a].y - positions[b].y)[0] || "AD";
}

export function rotationFromSlots(raw) {
  const positions = {};
  for (const zone of ZONE_ORDER) {
    positions[raw.slots[zone]] = { ...ZONE_CENTER[zone] };
  }
  return { id: raw.id, setter: raw.setter, positions };
}

export const DEFAULT_ROTATIONS = RAW_ROTATIONS.map(rotationFromSlots);

export function tokensFor(rotation) {
  return ROLE_IDS.map((id) => ({
    id: `${rotation.id}-${id}`,
    role: id,
    x: rotation.positions[id].x,
    y: rotation.positions[id].y,
    setter: id === rotation.setter,
  }));
}

export function zoneOf(rotation, role) {
  const point = rotation.positions?.[role];
  if (!point) return null;
  return zoneAt(point.x, point.y);
}

export function explainRotation(rotation) {
  const code = rotationName(rotation.id);
  const setterName = ROLES[rotation.setter]?.name || rotation.setter;
  const setterZone = ZONE_LABEL[zoneOf(rotation, rotation.setter)];
  const other = rotation.setter === "AD" ? "AT" : "AD";
  const otherName = ROLES[other].name;
  const otherZone = ZONE_LABEL[zoneOf(rotation, other)];
  const centralZone = ZONE_LABEL[zoneOf(rotation, "C")];
  const liberoZone = ZONE_LABEL[zoneOf(rotation, "L")];

  return `En ${code} coloca el ${setterName.toLowerCase()} porque está ${setterZone}, en red. El ${otherName.toLowerCase()} está ${otherZone} y juega de opuesto. El central está ${centralZone} y el líbero ${liberoZone}.`;
}

export function explainPost(rotation, roles) {
  return roles.map((id) => explainRole(rotation, id)).join(" ");
}

export function explainRole(rotation, role) {
  const zone = ZONE_LABEL[zoneOf(rotation, role)];
  const name = ROLES[role].name;
  const code = rotationName(rotation.id);
  const setterName = ROLES[rotation.setter]?.name || rotation.setter;

  if (role === rotation.setter) {
    return `En ${code}, ${name} coloca desde ${zone}.`;
  }
  if (role === "L") {
    return `En ${code} el líbero recibe ${zone}, en el sitio del central de atrás.`;
  }
  if (role === "C") {
    return `En ${code} el central de red está ${zone}. Coloca el ${setterName.toLowerCase()}.`;
  }
  if (SETTER_IDS.includes(role)) {
    return `En ${code}, ${name} está ${zone} y juega de opuesto. Coloca el ${setterName.toLowerCase()}.`;
  }
  return `En ${code}, ${name} está ${zone}. Coloca el ${setterName.toLowerCase()}.`;
}

export function readCourtPoint(clientX, clientY) {
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
