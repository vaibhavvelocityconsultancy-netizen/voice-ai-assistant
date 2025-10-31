import React, { useState, useRef } from "react";
import axios from "axios";
import { WaveFile } from "wavefile";
import { useDispatch } from "react-redux";
import { addMessage } from "../Store/conversationSlice";

const MicButton: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const dispatch = useDispatch();

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

        // ✅ Verification logs
        console.log("🎧 WAV file successfully converted!");
        console.log("📁 Type:", wavBlob.type);
        console.log("📏 Size:", wavBlob.size, "bytes");

        // ✅ (Optional) Auto-download the WAV file for manual check
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.wav";
        a.click();

        // ✅ SEND TO BACKEND
        const formData = new FormData();
        formData.append("file", wavBlob, "recording.wav");

        try {
          const response = await axios.post("http://localhost:8000/api/stt", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log("✅ Uploaded successfully:", response.data);

          dispatch(addMessage({ role: "user", text: "🎤 Sent voice message..." }));
          if (response.data?.transcript) {
            dispatch(addMessage({ role: "assistant", text: response.data.transcript }));
          } else {
            dispatch(addMessage({ role: "assistant", text: "⚠️ No transcript received from backend." }));
          }
        } catch (err) {
          console.error("❌ Upload failed:", err);
          dispatch(addMessage({ role: "assistant", text: "❌ Upload failed, please try again." }));
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("🎙️ Mic access error:", err);
      alert("Microphone not available or permission denied.");
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
