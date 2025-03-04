import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarAnimation from "./StarAnimation";
import { decodePolyline, encodePolyline } from "./PolylineUtils";

function RunInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const [data, setData] = useState(null);

  useEffect(() => {
    // Get the query parameters from the URL
    const urlParams = new URLSearchParams(location.search);
    const encodedData = urlParams.get("data");

    if (encodedData) {
      // Decode and parse the JSON string back into an object
      const decodedData = decodeURIComponent(encodedData);
      const parsedData = JSON.parse(decodedData);
      const decodedCoordinates = decodePolyline(parsedData.coordinates);
      setData({
        coordinates: decodedCoordinates,
        name: parsedData.name,
        distance: parsedData.distance,
      });
    }
  }, [location]);

  // Function to handle sharing the URL with state data
  const handleShare = () => {
    const encodedCoordinates = encodePolyline(data.coordinates);
    const serializedData = JSON.stringify({
      coordinates: encodedCoordinates,
      name: data.name,
      distance: data.distance,
    });
    const encodedData = encodeURIComponent(serializedData);
    const link = `${window.location.origin}/animate?data=${encodedData}`;

    // Copy the link to the clipboard
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  if (!data) {
    return <div>Not found.</div>;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Star Animation with Movement */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: showInfo ? -15 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <StarAnimation data={data} setShowInfo={setShowInfo} />
      </motion.div>

      {/* Smooth Animated Info Section */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 55 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col gap-2 mt-4"
          >
            {/* Run Information */}
            <div className="max-w-xl text-center gap-4">
              <h1 className="text-3xl font-semibold pt-8">{data.name}</h1>
              <p className="text-xl">
                Distance: {data.distance.toFixed(2)} miles
              </p>
              <p className="text-xl">
                🌜 {(data.distance / 2388.55).toFixed(6)}% of the way to the
                moon 🌛
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 bg-indigo-900 text-center rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer"
              >
                Share
              </button>

              {/* Explore Galaxy Button */}
              <button
                onClick={() => navigate("/galaxy")}
                className="w-full py-3 px-4 bg-indigo-900 text-center rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer"
              >
                Explore Galaxy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RunInfo;
