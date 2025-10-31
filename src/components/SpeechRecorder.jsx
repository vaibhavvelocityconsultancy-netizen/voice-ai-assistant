// // SpeechRecorder.tsx
// import React, { useState, useRef } from "react";

// const SpeechRecorder = () => {
//   const [transcript, setTranscript] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);

//   const startListening = () => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       alert("Speech recognition not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-IN";
//     recognition.interimResults = true;
//     recognition.continuous = true;

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       const transcriptText = Array.from(event.results)
//         .map((result) => result[0].transcript)
//         .join("");
//       setTranscript(transcriptText);
//     };

//     recognition.onerror = (e) => console.error("Recognition error:", e);
//     recognition.onend = () => setIsListening(false);

//     recognition.start();
//     recognitionRef.current = recognition;
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     recognitionRef.current?.stop();
//     setIsListening(false);
//   };

//   return (
//     <div className="flex flex-col items-center p-6">
//       <h2 className="text-lg font-semibold mb-2">🎙️ Voice to Text (Local)</h2>
//       <div className="p-4 w-[400px] h-[150px] border rounded-md bg-gray-50 overflow-auto">
//         {transcript || "Say something..."}
//       </div>
//       <div className="flex gap-3 mt-4">
//         {!isListening ? (
//           <button
//             onClick={startListening}
//             className="bg-green-600 text-white px-4 py-2 rounded-full"
//           >
//             Start Speaking
//           </button>
//         ) : (
//           <button
//             onClick={stopListening}
//             className="bg-red-600 text-white px-4 py-2 rounded-full"
//           >
//             Stop
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SpeechRecorder;
