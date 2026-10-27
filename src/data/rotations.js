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

export const ZONE_LABEL = {
  z4: "delantero, a la izquierda",
  z3: "delantero, en el centro",
  z2: "delantero, a la derecha",
  z5: "trasero, a la izquierda",
  z6: "trasero, en el centro",
  z1: "trasero, a la derecha",
};

const SAVED_POSITIONS = [
  {
    AD: { x: 12, y: 10 },
    AT: { x: 91, y: 82 },
    C: { x: 12, y: 21 },
    L: { x: 82, y: 62 },
    RD: { x: 18, y: 61 },
    RT: { x: 50, y: 74 },
  },
  {
    AD: { x: 85, y: 10 },
    AT: { x: 61, y: 88 },
    C: { x: 12, y: 10 },
    L: { x: 82, y: 62 },
    RD: { x: 21, y: 62 },
    RT: { x: 53, y: 70 },
  },
  {
    AD: { x: 71, y: 10 },
    AT: { x: 68, y: 85 },
    C: { x: 72, y: 22 },
    L: { x: 48, y: 70 },
    RD: { x: 23, y: 56 },
    RT: { x: 80, y: 59 },
  },
  {
    AD: { x: 17, y: 10 },
    AT: { x: 84, y: 86 },
    C: { x: 17, y: 22 },
    L: { x: 80, y: 58 },
    RD: { x: 20, y: 57 },
    RT: { x: 50, y: 71 },
  },
  {
    AD: { x: 75, y: 10 },
    AT: { x: 33, y: 85 },
    C: { x: 16, y: 10 },
    L: { x: 80, y: 62 },
    RD: { x: 21, y: 62 },
    RT: { x: 53, y: 76 },
  },
  {
    AD: { x: 69, y: 10 },
    AT: { x: 61, y: 88 },
    C: { x: 70, y: 20 },
    L: { x: 49, y: 65 },
    RD: { x: 17, y: 58 },
    RT: { x: 79, y: 60 },
  },
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

export const DEFAULT_ROTATIONS = SAVED_POSITIONS.map((positions, index) => ({
  id: index + 1,
  setter: deriveSetter(positions),
  positions,
}));

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
