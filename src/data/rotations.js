export const ROLE_IDS = ["A1", "A2", "C", "L", "RD", "RT"];

export const ROLES = {
  A1: {
    id: "A1",
    name: "Armador 1",
    hint: "Coloca cuando está delante",
  },
  A2: {
    id: "A2",
    name: "Armador 2",
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
  { id: 1, setter: "A1", slots: { z4: "RD", z3: "C", z2: "A1", z5: "A2", z6: "L", z1: "RT" } },
  { id: 2, setter: "A2", slots: { z4: "A2", z3: "RD", z2: "C", z5: "L", z6: "RT", z1: "A1" } },
  { id: 3, setter: "A2", slots: { z4: "C", z3: "A2", z2: "RD", z5: "RT", z6: "A1", z1: "L" } },
  { id: 4, setter: "A2", slots: { z4: "RT", z3: "C", z2: "A2", z5: "A1", z6: "L", z1: "RD" } },
  { id: 5, setter: "A1", slots: { z4: "A1", z3: "RT", z2: "C", z5: "L", z6: "RD", z1: "A2" } },
  { id: 6, setter: "A1", slots: { z4: "C", z3: "A1", z2: "RT", z5: "RD", z6: "A2", z1: "L" } },
];

export function zoneAt(x, y) {
  const column = x < 100 / 3 ? 0 : x < 200 / 3 ? 1 : 2;
  const row = y < 37.5 ? ["z4", "z3", "z2"] : ["z5", "z6", "z1"];
  return row[column];
}

export function deriveSetter(positions) {
  const setters = ["A1", "A2"].filter((id) => positions[id]);
  const front = setters.filter((id) => positions[id].y < 37.5);
  const pool = front.length ? front : setters;
  return pool.sort((a, b) => positions[a].y - positions[b].y)[0] || "A1";
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
  const setterZone = ZONE_LABEL[zoneOf(rotation, rotation.setter)];
  const other = rotation.setter === "A1" ? "A2" : "A1";
  const otherZone = ZONE_LABEL[zoneOf(rotation, other)];
  const centralZone = ZONE_LABEL[zoneOf(rotation, "C")];
  const liberoZone = ZONE_LABEL[zoneOf(rotation, "L")];

  return `Coloca ${rotation.setter} porque está ${setterZone}, en red. ${other} está ${otherZone} y juega de opuesto. El central está ${centralZone} y el líbero ${liberoZone}.`;
}

export function explainRole(rotation, role) {
  const zone = ZONE_LABEL[zoneOf(rotation, role)];
  const name = ROLES[role].name;

  if (role === rotation.setter) {
    return `En la rotación ${rotation.id}, ${name} coloca desde ${zone}.`;
  }
  if (role === "L") {
    return `En la rotación ${rotation.id} el líbero recibe ${zone}, en el sitio del central de atrás.`;
  }
  if (role === "C") {
    return `En la rotación ${rotation.id} el central de red está ${zone}. Coloca ${rotation.setter}.`;
  }
  if (role === "A1" || role === "A2") {
    return `En la rotación ${rotation.id}, ${name} está ${zone} y juega de opuesto. Coloca ${rotation.setter}.`;
  }
  return `En la rotación ${rotation.id}, ${name} está ${zone}. Coloca ${rotation.setter}.`;
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
