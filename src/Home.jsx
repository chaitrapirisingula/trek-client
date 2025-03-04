import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".gpx")) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid GPX file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !name) {
      alert("Please select a file and enter a name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", name);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/upload_gpx`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        alert("Upload failed");
        return;
      }

      const data = await response.json();
      if (data) {
        const serializedData = JSON.stringify(data);
        const encodedData = encodeURIComponent(serializedData);
        navigate(`/animate?data=${encodedData}`);
        setSelectedFile(null);
        setName("");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <h1 className="text-6xl font-bold">trek💫</h1>
      <p>run to the moon 🚀</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-4 bg-indigo-900 text-center rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Upload Run (GPX)
        </button>

        <button
          className="py-3 px-4 bg-indigo-900 text-center rounded-lg shadow-md hover:bg-indigo-700 transition"
          onClick={() => navigate("/galaxy")}
        >
          Explore the galaxy 🌌
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50">
          <div className="bg-gray-500 text-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Upload GPX File</h2>
            <div className="flex flex-col items-center gap-4">
              {/* Name Input */}
              <input
                type="text"
                placeholder="Name your run"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-100 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* File Selection */}
              <label className="cursor-pointer bg-gray-200 text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition inline-block">
                Select GPX File
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {/* Display Selected File */}
              {selectedFile && (
                <p className="mt-2 font-medium">{selectedFile.name}</p>
              )}

              {/* Upload and Cancel Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
