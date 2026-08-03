import { useMemo } from "react";
import { feature } from "topojson-client";
import land from "../../assets/map/land-110m.json";
import { getCountryCoordinates } from "../../lib/countryCoordinates.ts";
import type { Person } from "../../types/index.ts";

const WIDTH = 960;
const HEIGHT = 460;

type Ring = [number, number][];
type PolygonCoords = Ring[];

interface Topology {
  type: "Topology";
  objects: { land: { type: string; geometries?: unknown[] } };
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
}

interface Geometry {
  type: "Polygon" | "MultiPolygon" | "GeometryCollection";
  coordinates?: PolygonCoords | PolygonCoords[];
  geometries?: Geometry[];
}

function project([lng, lat]: [number, number]): [number, number] {
  return [((lng + 180) / 360) * WIDTH, ((90 - lat) / 180) * HEIGHT];
}

function ringToPath(ring: Ring): string {
  return (
    ring
      .map(project)
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ") + "Z"
  );
}

function polygonToPath(coords: PolygonCoords): string {
  return coords.map(ringToPath).join(" ");
}

function geometryToPath(geometry: Geometry): string {
  if (geometry.type === "Polygon") return polygonToPath(geometry.coordinates as PolygonCoords);
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as PolygonCoords[]).map(polygonToPath).join(" ");
  }
  return "";
}

interface WorldMapProps {
  people: Person[];
}

export default function WorldMap({ people }: WorldMapProps) {
  const landPath = useMemo(() => {
    const topology = land as unknown as Topology;
    const geo = feature(topology as never, topology.objects.land as never) as unknown as
      | Geometry
      | { type: "FeatureCollection"; features: { geometry: Geometry }[] };
    if ("features" in geo) {
      return geo.features.map((f) => geometryToPath(f.geometry)).join(" ");
    }
    return geometryToPath(geo);
  }, []);

  const markers = useMemo(() => {
    const seen = new Map<string, { coords: [number, number]; names: string[] }>();
    for (const person of people) {
      const coords = getCountryCoordinates(person.locationCountry);
      if (!coords) continue;
      const key = person.locationCountry as string;
      const existing = seen.get(key);
      if (existing) {
        existing.names.push(person.name);
      } else {
        seen.set(key, { coords, names: [person.name] });
      }
    }
    return [...seen.entries()].map(([country, { coords, names }]) => ({
      country,
      names,
      point: project(coords),
    }));
  }, [people]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label="Map showing where Mrama researchers are based"
    >
      <path d={landPath} className="fill-surface stroke-border" strokeWidth={0.5} />
      {markers.map(({ country, names, point: [x, y] }) => (
        <g key={country}>
          <circle cx={x} cy={y} r={10} className="motion-safe:animate-ping fill-accent/30" />
          <circle cx={x} cy={y} r={3.5} className="fill-accent">
            <title>{`${country} — ${names.join(", ")}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
