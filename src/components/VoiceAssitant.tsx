import React from "react";
import MicButton from "./MicButton";
import ChatWindow from "./ChatWindow";
import AudioRecorder from "./AudioRecorder";

const VoiceAssistant = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <ChatWindow />
      <MicButton />
      <AudioRecorder /> Hidden, just listening to Redux
    </div>
  );
};

export default VoiceAssistant;
