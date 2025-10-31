import React, { useState, useRef } from "react";
import axios from "axios";
import { convertToWav } from "../utils/convertToWav";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wavUrl, setWavUrl] = useState<string | null>(null); // ✅ separate WAV preview
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // 🎙 Combine all chunks into one Blob
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob)); // 👈 this is original

        // ✅ Convert to WAV format
        const wavBlob = await convertToWav(audioBlob);
        console.log("🎧 WAV Ready:", wavBlob);
        console.log("Type:", wavBlob.type, "Size:", wavBlob.size, "bytes");

        // 🔊 Set WAV preview
        const wavBlobUrl = URL.createObjectURL(wavBlob);
        setWavUrl(wavBlobUrl); // 👈 play WAV version now!

        // 💾 Optional: Auto download WAV for testing
        const link = document.createElement("a");
        link.href = wavBlobUrl;
        link.download = "recording.wav";
        link.click();

        // 🚀 Send to backend
        const formData = new FormData();
        formData.append("file", wavBlob, "recording.wav");

        try {
          const response = await axios.post(
            "http://192.168.29.231:8000/stt/",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log("✅ Uploaded successfully:", response.data);
        } catch (error) {
          console.error("❌ Upload failed:", error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("🎙️ Mic access error:", err);
      alert("Microphone not available or permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md text-white ${
          isRecording ? "bg-red-500 animate-pulse" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {wavUrl && (
        <audio
          controls
          src={wavUrl}
          className="mt-3 w-full rounded-md border border-gray-300"
        ></audio>
      )}
    </div>
  );
};

export default AudioRecorder;
