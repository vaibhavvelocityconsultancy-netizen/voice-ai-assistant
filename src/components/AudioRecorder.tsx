import React, { useState, useRef } from "react";
import axios from "axios";
import { convertToWav } from "../utils/convertToWav";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [backendResponse, setBackendResponse] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 48000 },
      });

      const options = { mimeType: "audio/webm;codecs=opus" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
        const wavBlob = await convertToWav(audioBlob);
        const wavBlobUrl = URL.createObjectURL(wavBlob);
        setWavUrl(wavBlobUrl);

        const formData = new FormData();
        formData.append("file", wavBlob, "recording.wav");

        try {
          const response = await axios.post(
            "https://briefly-unretrenched-drucilla.ngrok-free.dev/stt",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 30000,
            }
          );

          console.log("✅ Backend Full Response:", response.data);

          // handle flexible response keys
          const userText =
            response.data.text ||
            response.data.transcript ||
            response.data.result ||
            response.data.message ||
            "";

          // 🧠 Show what user said
          setTranscript(userText || "⚠️ No text returned by backend.");
          console.log(userText);
          

          // 💬 Also display entire backend JSON for debugging
          setBackendResponse(
            JSON.stringify(response.data, null, 2)
          );
        } catch (error: any) {
          console.error("❌ Upload/STT failed:", error);
          setTranscript("❌ Failed to get transcription.");
          setBackendResponse(
            error.response
              ? `Error ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}`
              : "❌ No backend response received."
          );
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
    setTimeout(() => {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }, 300);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md text-white font-semibold ${
          isRecording
            ? "bg-red-500 animate-pulse"
            : "bg-green-600 hover:bg-green-700"
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

      {transcript && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md border w-full">
          <h3 className="font-semibold text-gray-700 mb-2">🧍 You said:</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {backendResponse && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md border w-full">
          <h3 className="font-semibold text-gray-700 mb-2">🤖 Backend Response:</h3>
          <pre className="text-gray-800 whitespace-pre-wrap text-sm">
            {backendResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;  