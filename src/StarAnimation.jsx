import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConstellationSVG, PolylineMap, PolylineSVG } from "./PolylineUtils";

export default function StarAnimation({ data, setShowInfo }) {
  const coords = data.coordinates;

  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Transition through the 4 stages: Map → Polyline → Constellation → Stars
    const timers = [
      setTimeout(() => setStage(1), 3000),
      setTimeout(() => setStage(2), 5000),
      setTimeout(() => setStage(3), 7000),
      setTimeout(() => setShowInfo(true), 8500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex justify-center items-center mx-auto">
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            key="map"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center w-full h-full my-8"
          >
            <PolylineMap coords={coords} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            key="polyline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
          >
            <PolylineSVG coords={coords} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 2 && (
          <motion.div
            key="constellation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
          >
            <ConstellationSVG coords={coords} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 3 && (
          <motion.div
            key="constellation"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
          >
            <ConstellationSVG coords={coords} stars={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
