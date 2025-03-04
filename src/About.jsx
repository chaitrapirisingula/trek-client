import React from "react";

function About() {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-4xl font-semibold text-center">About</h1>
      <p className="text-lg text-center">
        Trek💫 lets you visualize your running, biking, and walking paths as
        constellations and explore paths from other users
      </p>
      <p className="text-lg text-center">
        Upload your GPX data from Strava, Garmin, or other platforms to see your
        journey mapped to the stars 🌌
      </p>
    </div>
  );
}

export default About;
