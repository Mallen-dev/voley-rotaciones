export const ROLE_IDS = ["A1", "A2", "C", "L", "R1", "R2"];

export const ROLES = {
  A1: {
    id: "A1",
    name: "Armador 1",
    hint: "Coloca en las rotaciones 1, 5 y 6",
  },
  A2: {
    id: "A2",
    name: "Armador 2",
    hint: "Coloca en las rotaciones 2, 3 y 4",
  },
  C: {
    id: "C",
    name: "Central",
    hint: "Siempre en red, en recepción",
  },
  L: {
    id: "L",
    name: "Líbero",
    hint: "Siempre atrás, en el sitio del otro central",
  },
  R1: {
    id: "R1",
    name: "Receptor 1",
    hint: "Entra por banda",
  },
  R2: {
    id: "R2",
    name: "Receptor 2",
    hint: "Entra por la otra banda",
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

export function zoneAt(x, y) {
  const column = x < 100 / 3 ? 0 : x < 200 / 3 ? 1 : 2;
  const row = y < 37.5 ? ["z4", "z3", "z2"] : ["z5", "z6", "z1"];
  return row[column];
}

export function slotsToTokens(slots, setter) {
  return ZONE_ORDER.map((zone) => ({
    id: `${zone}-${slots[zone]}`,
    role: slots[zone],
    x: ZONE_CENTER[zone].x,
    y: ZONE_CENTER[zone].y,
    setter: slots[zone] === setter,
  }));
}

export const FRONT_ZONES = new Set(["z4", "z3", "z2"]);

export const ROTATIONS = [
  { id: 1, setter: "A1", slots: { z4: "R1", z3: "C", z2: "A1", z5: "A2", z6: "L", z1: "R2" } },
  { id: 2, setter: "A2", slots: { z4: "A2", z3: "R1", z2: "C", z5: "L", z6: "R2", z1: "A1" } },
  { id: 3, setter: "A2", slots: { z4: "C", z3: "A2", z2: "R1", z5: "R2", z6: "A1", z1: "L" } },
  { id: 4, setter: "A2", slots: { z4: "R2", z3: "C", z2: "A2", z5: "A1", z6: "L", z1: "R1" } },
  { id: 5, setter: "A1", slots: { z4: "A1", z3: "R2", z2: "C", z5: "L", z6: "R1", z1: "A2" } },
  { id: 6, setter: "A1", slots: { z4: "C", z3: "A1", z2: "R2", z5: "R1", z6: "A2", z1: "L" } },
];

export function zoneOf(rotation, role) {
  return ZONE_ORDER.find((zone) => rotation.slots[zone] === role) ?? null;
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

export function isFront(zone) {
  return FRONT_ZONES.has(zone);
}
