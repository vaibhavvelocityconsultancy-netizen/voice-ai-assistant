import React from "react";
import VoiceAssistant from "./components/VoiceAssitant";

const App = () => {
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Voice AI Receptionist</h1>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4">
        <VoiceAssistant />
      </div>
    </div>
  );
};

export default App;
