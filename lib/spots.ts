export type Level = "principiante" | "intermedio" | "experto";

export interface Spot {
  id: string;
  slug: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  level: Level;
  // direzione (gradi) da cui soffia il vento terral ideale per questo spot.
  // Da tarare dopo qualche uscita, come avevi annotato.
  offshore: number;
}

export const SPOTS: Spot[] = [
  { id: "arena", slug: "la-arena", name: "La Arena", zone: "Muskiz · Zierbena", lat: 43.349, lon: -3.110, level: "principiante", offshore: 165 },
  { id: "sopelana", slug: "sopelana", name: "Sopelana", zone: "Arrietara · Atxabiribil", lat: 43.390, lon: -2.998, level: "principiante", offshore: 170 },
  { id: "salvaje", slug: "la-salvaje", name: "La Salvaje", zone: "Barinatxe", lat: 43.378, lon: -2.984, level: "intermedio", offshore: 180 },
  { id: "bakio", slug: "bakio", name: "Bakio", zone: "Bakio", lat: 43.432, lon: -2.810, level: "principiante", offshore: 160 },
  { id: "mundaka", slug: "mundaka", name: "Mundaka", zone: "izquierda · desembocadura", lat: 43.408, lon: -2.698, level: "experto", offshore: 200 },
  { id: "laga", slug: "laga", name: "Laga", zone: "Ibarrangelu", lat: 43.423, lon: -2.630, level: "intermedio", offshore: 180 },
  { id: "zarautz", slug: "zarautz", name: "Zarautz", zone: "Gipuzkoa", lat: 43.285, lon: -2.175, level: "principiante", offshore: 185 },
];
