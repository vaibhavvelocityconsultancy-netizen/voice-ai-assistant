import React, { useState } from "react";

const VoiceRecorder: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first!");

    setIsUploading(true);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // later this will hit FastAPI endpoint
      const res = await fetch("http://localhost:8000/upload-audio/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setMessage("✅ Upload successful!");
      console.log("Server response:", data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">🎙️ Voice AI Receptionist</h1>

        <p className="text-gray-600 mb-6">
          Upload a recorded audio file (WAV PCM 16-bit) to test backend pipeline.
        </p>

        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="mb-4 w-full text-gray-700"
        />

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`px-6 py-2 rounded-full font-medium transition ${
            isUploading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Audio"}
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
