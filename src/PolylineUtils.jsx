import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

const smoothPath = (points, epsilon = 2) => {
  if (points.length < 3) return points;

  const sqDist = (p1, p2) => (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;

  const perpendicularDistance = (point, lineStart, lineEnd) => {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.sqrt(sqDist(point, lineStart));

    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;

    return Math.sqrt(sqDist(point, [nearestX, nearestY]));
  };

  const rdp = (points, start, end) => {
    let maxDist = 0;
    let index = start;

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (maxDist > epsilon) {
      const left = rdp(points, start, index);
      const right = rdp(points, index, end);
      return [...left.slice(0, -1), ...right];
    } else {
      return [points[start], points[end]];
    }
  };

  return rdp(points, 0, points.length - 1);
};
// Function to normalize points for SVG rendering
const normalizePoints = (points, width, height, epsilon = 0.000215) => {
  // Pass in points and epsilon value for smoothing
  points = smoothPath(points, epsilon);

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);

  const minLat = Math.min(...lats) - 0.002;
  const maxLat = Math.max(...lats) + 0.002;
  const minLng = Math.min(...lngs) - 0.002;
  const maxLng = Math.max(...lngs) + 0.002;

  return points.map(([lat, lng]) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height; // Flip Y-axis for SVG
    return [x, y];
  });
};

export const PolylineSVG = ({ coords, width = 250, height = 250 }) => {
  const [pointsString, setPointsString] = useState("");

  useEffect(() => {
    if (!coords) return;

    const scaledPoints = normalizePoints(coords, width, height, 0);
    setPointsString(scaledPoints.map((p) => p.join(",")).join(" "));
  }, [coords, width, height]);

  return (
    <svg width={width} height={height}>
      <polyline
        points={pointsString}
        fill="none"
        stroke="#FF5733"
        strokeWidth="2"
      />
    </svg>
  );
};

export const ConstellationSVG = ({
  coords,
  width = 250,
  height = 250,
  stars,
}) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!coords) return;

    const scaledPoints = normalizePoints(coords, width, height);
    setPoints(scaledPoints);
  }, [coords, width, height]);

  // Select a few key points as stars (every ~2nd point)
  const starIndices =
    stars === true
      ? new Set(
          points
            .map((_, index) => (index % 2 === 0 ? index : null))
            .filter((i) => i !== null)
        )
      : new Set();

  return (
    <svg width={width} height={height}>
      {/* Glowing stars at key points */}
      {points.map(([x, y], index) =>
        starIndices.has(index) ? (
          <polygon
            key={index}
            points="
              10,0  12,6 
              18,6  13,10 
              15,16  10,12 
              5,16  7,10 
              2,6   8,6
            " // Star shape
            transform={`translate(${x - 10}, ${y - 10})`} // Position the star
            fill="white"
            stroke="yellow"
            strokeWidth="2"
            filter="drop-shadow(0px 0px 8px white)"
          />
        ) : null
      )}

      {/* Constellation lines with mix of dashed and solid */}
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="lightblue"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6,8" // Dashed lines for a playful effect
        opacity="0.9"
        style={{ filter: "drop-shadow(0px 0px 5px lightblue)" }}
      />
    </svg>
  );
};
const calculatePolylineCenter = (coords) => {
  const lats = coords.map(([lat]) => lat);
  const lngs = coords.map(([, lng]) => lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs); // Calculate the midpoint

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return { lat: centerLat, lng: centerLng };
};
export const PolylineMap = ({ coords }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!coords) return;

    if (!map) {
      const center = calculatePolylineCenter(coords); // Initialize the Mapbox map only once

      const mapInstance = new mapboxgl.Map({
        container: "map", // ID of the div where the map should render
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: [center.lng, center.lat - 1], // Set center to the middle of the polyline
        zoom: 15, // Initial zoom level
      });

      // Add the polyline to the map
      const polyline = coords.map(([lat, lng]) => [lng, lat]); // Map to [lng, lat] format for Mapbox
      mapInstance.on("load", () => {
        mapInstance.addSource("polyline", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: polyline,
            },
          },
        });

        mapInstance.addLayer({
          id: "polyline-layer",
          type: "line",
          source: "polyline",
          paint: {
            "line-color": "#FF5733", // Line color
            "line-width": 3, // Line width
          },
        });

        // Fit the map to the polyline
        const bounds = new mapboxgl.LngLatBounds();
        polyline.forEach((coord) => bounds.extend(coord));
        mapInstance.fitBounds(bounds, { padding: 20 });

        // Store the map instance in the state
        setMap(mapInstance);
      });
    }

    // Clean up on unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [coords, map]);

  return <div id="map" className="w-full h-full mt-12"></div>;
};
