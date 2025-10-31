import React, { useState, useRef } from "react";
import { convertToWav } from "../utils/convertToWav";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));

        // ✅ Convert to WAV
        const wavBlob = await convertToWav(audioBlob);
        console.log("🎧 WAV Ready:", wavBlob);
        console.log("Type:", wavBlob.type, "Size:", wavBlob.size, "bytes");

        // 🕒 Later: Send to backend via axios.post()
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
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
        className="px-4 py-2 rounded-md bg-blue-600 text-white"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioUrl && (
        <audio controls src={audioUrl} className="mt-3 w-full"></audio>
      )}
    </div>
  );
};

export default AudioRecorder;
