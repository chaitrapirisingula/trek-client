import React, { useState, useEffect, useRef } from "react";
import { ConstellationSVG } from "./PolylineUtils.jsx";
import { useNavigate } from "react-router-dom";

const Galaxy = () => {
  const width = 130;
  const height = 130;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef();
  const dragSpeedMultiplier = 1;
  const [constellations, setConstellations] = useState(null);
  const [constellationPositions, setConstellationPositions] = useState([]);
  const galaxyWidth = 1000; // Width of the virtual galaxy space
  const galaxyHeight = 1000; // Height of the virtual galaxy space
  const padding = 50; // Minimum distance between constellations

  const navigate = useNavigate();

  // Function to check if a position would overlap with existing positions
  const wouldOverlap = (newPos, existingPositions) => {
    for (const pos of existingPositions) {
      // Calculate the distance between centers
      const dist = Math.sqrt(
        Math.pow(newPos.x + width / 2 - (pos.x + width / 2), 2) +
          Math.pow(newPos.y + height / 2 - (pos.y + height / 2), 2)
      );

      // If distance is less than combined dimensions plus padding, they overlap
      const minDistance = Math.sqrt(width * width + height * height) + padding;
      if (dist < minDistance) {
        return true;
      }
    }
    return false;
  };

  // Generate a non-overlapping position
  const generateNonOverlappingPosition = (existingPositions) => {
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    let newPos;

    do {
      newPos = {
        x: Math.random() * (galaxyWidth - width - padding * 2) + padding,
        y: Math.random() * (galaxyHeight - height - padding * 2) + padding,
        rotation: Math.random() * 360,
        scale: 0.7 + Math.random() * 0.6,
      };
      attempts++;
    } while (wouldOverlap(newPos, existingPositions) && attempts < maxAttempts);

    // If we can't find a spot after max attempts, use cellular placement
    if (attempts >= maxAttempts) {
      // Find the spot with the maximum distance from all existing constellations
      let bestPos = newPos;
      let maxMinDist = 0;

      for (let i = 0; i < 30; i++) {
        // Try 30 random positions
        const testPos = {
          x: Math.random() * (galaxyWidth - width - padding * 2) + padding,
          y: Math.random() * (galaxyHeight - height - padding * 2) + padding,
        };

        let minDist = Number.MAX_VALUE;
        for (const pos of existingPositions) {
          const dist = Math.sqrt(
            Math.pow(testPos.x + width / 2 - (pos.x + width / 2), 2) +
              Math.pow(testPos.y + height / 2 - (pos.y + height / 2), 2)
          );
          minDist = Math.min(minDist, dist);
        }

        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          bestPos = {
            ...testPos,
            rotation: Math.random() * 360,
            scale: 0.7 + Math.random() * 0.6,
          };
        }
      }

      return bestPos;
    }

    return newPos;
  };

  useEffect(() => {
    const get_constellations = async () => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/get_constellations`, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(
                errorData.error ||
                  `Request failed with status ${response.status}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `Successfully fetched ${data.constellations.length} constellations`
          );
          setConstellations(data.constellations);

          // Generate non-overlapping positions
          const positions = [];
          for (let i = 0; i < data.constellations.length; i++) {
            const pos = generateNonOverlappingPosition(positions);
            positions.push(pos);
          }

          setConstellationPositions(positions);
          return data;
        })
        .catch((error) => {
          console.error("Error fetching constellation data:", error);
        });
    };
    get_constellations();
  }, []);

  const startDrag = (e) => {
    setDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastPosRef.current = { x: clientX, y: clientY };
  };

  const drag = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const updatePosition = () => {
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      if (dx !== 0 || dy !== 0) {
        setOffset((prev) => ({
          x: prev.x + dx * dragSpeedMultiplier,
          y: prev.y + dy * dragSpeedMultiplier,
        }));
        lastPosRef.current = { x: clientX, y: clientY };
      }
    };

    cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(updatePosition);
  };

  const stopDrag = () => {
    setDragging(false);
    cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    const handleMove = (e) => drag(e);
    const handleUp = () => stopDrag();

    if (dragging) {
      window.addEventListener("mousemove", handleMove, { passive: true });
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove, { passive: true });
      window.addEventListener("touchend", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [dragging]);

  // Initial center position
  useEffect(() => {
    // Center the view in the galaxy
    setOffset({
      x: window.innerWidth / 2 - galaxyWidth / 2,
      y: window.innerHeight / 2 - galaxyHeight / 2,
    });
  }, []);

  return (
    <div
      className="relative cursor-grab active:cursor-grabbing"
      style={{
        width: "100vw",
        height: "80vh",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
      }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <div
        style={{
          position: "absolute",
          left: `${offset.x}px`,
          top: `${offset.y}px`,
          width: galaxyWidth,
          height: galaxyHeight,
          transform: "translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        {constellations &&
          constellations.map((constellation, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: constellationPositions[index]?.x || 0,
                top: constellationPositions[index]?.y || 0,
                transform: `rotate(${
                  constellationPositions[index]?.rotation || 0
                }deg) scale(${constellationPositions[index]?.scale || 1})`,
                width: width,
                height: height,
              }}
              onClick={() => {
                const serializedData = JSON.stringify(constellation);
                const encodedData = encodeURIComponent(serializedData);
                navigate(`/animate?data=${encodedData}`);
              }}
            >
              <ConstellationSVG
                coords={constellation.coordinates}
                width={width}
                height={height}
                stars={true}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Galaxy;
