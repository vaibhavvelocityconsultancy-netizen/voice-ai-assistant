import React from "react";
import VoiceReceptionist from "./components/VoiceRecptionist";
import Sidebar from "./components/Sidebar";

const App = () => {
  return (
    <div className="min-h-screen w-full  text-gray-800 flex flex-col items-center justify-center relative">
      {/* <h1 className="text-3xl font-semibold  mb-6">Voice AI Receptionist</h1> */}
      
      <div className="w-full max-w-full bg-gray-700 shadow-lg rounded-2xl flex flex-col gap-4">
        <VoiceReceptionist />
      </div>
    </div>
  );
};

export default App;
