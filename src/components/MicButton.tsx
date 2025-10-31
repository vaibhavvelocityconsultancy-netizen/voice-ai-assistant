import React, { useState, useRef } from "react";
import axios from "axios";
import { WaveFile } from "wavefile";

const MicButton: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
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
        const arrayBuffer = await audioBlob.arrayBuffer();

        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const pcmData = audioBuffer.getChannelData(0);

        const wav = new WaveFile();
        wav.fromScratch(1, audioBuffer.sampleRate, "16", pcmData);

        const wavBytes = new Uint8Array(wav.toBuffer());
        const wavBlob = new Blob([wavBytes], { type: "audio/wav" });

        console.log("🎧 WAV file ready:", wavBlob);

        // ✅ SEND TO BACKEND (mock)
        const formData = new FormData();
        formData.append("file", wavBlob, "recording.wav");

        try {
          const response = await axios.post("http://localhost:8000/api/stt", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log("✅ Uploaded successfully:", response.data);
        } catch (err) {
          console.error("❌ Upload failed:", err);
        }
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
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`rounded-full p-4 mt-4 text-white text-lg transition-all ${
        isRecording ? "bg-red-500 animate-pulse" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {isRecording ? "🛑 Stop Listening" : "🎙️ Start Listening"}
    </button>
  );
};

export default MicButton;
