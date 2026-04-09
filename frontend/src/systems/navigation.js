import * as THREE from 'three';

export const GRID = 10;

export function snap(v) {
  return Math.round(v / GRID) * GRID;
}

const at = (x, z) => new THREE.Vector3(snap(x), 0, snap(z));

export const LOCATIONS = {
  HOME: at(0, 0),
  OFFICE: at(80, 0),
  HOSPITAL: at(-20, 0),
  FARM: at(0, -30),
  VILLAGE: at(0, -130),
};

export const LOCATION_KEYS = {
  home: 'HOME',
  office: 'OFFICE',
  hospital: 'HOSPITAL',
  farm: 'FARM',
  village: 'VILLAGE',
};

export const BUILDING_POSITIONS = {
  home: LOCATIONS.HOME,
  office: LOCATIONS.OFFICE,
  hospital: LOCATIONS.HOSPITAL,
  farm: LOCATIONS.FARM,
  village: LOCATIONS.VILLAGE,
};

export const LOCATION_TARGETS = {
  home: LOCATIONS.HOME.clone(),
  office: LOCATIONS.OFFICE.clone(),
  hospital: LOCATIONS.HOSPITAL.clone(),
  farm: LOCATIONS.FARM.clone(),
  village: LOCATIONS.VILLAGE.clone(),
};

export function toLocationKey(value = 'home') {
  return LOCATION_KEYS[String(value).toLowerCase()] || 'HOME';
}

export function toLocationId(value = 'HOME') {
  return String(value).toLowerCase();
}
