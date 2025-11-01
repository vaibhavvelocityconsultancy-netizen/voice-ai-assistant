import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";

const VoiceReceptionist = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("aiChats");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChat, setActiveChat] = useState(0);
  const recognitionRef = useRef<any>(null);

  const messages = chats[activeChat]?.messages || [];

  // 🧠 Save chats in localStorage
  useEffect(() => {
    localStorage.setItem("aiChats", JSON.stringify(chats));
  }, [chats]);

  // 🔊 Speak (browser TTS fallback)
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // 🎤 Start browser live transcription
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");

      // 🧠 Update latest user text in UI while speaking
      setChats((prev) => {
        const updated = [...prev];
        const chat = updated[activeChat] || { messages: [] };
        const lastMsg = chat.messages.at(-1);
        if (lastMsg && lastMsg.from === "user") {
          lastMsg.text = transcript;
        } else {
          chat.messages.push({ from: "user", text: transcript });
        }
        updated[activeChat] = chat;
        return updated;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop?.();
  };

  // 🎙️ Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        stopSpeechRecognition(); // stop live speech-to-text
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        setLoading(true);

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.wav");

          const response = await fetch(
            "https://briefly-unretrenched-drucilla.ngrok-free.dev/stt",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) throw new Error(await response.text());

          const json = await response.json();
          const userText = json.transcribed_text || json.userText || "";
          const botText = json.reply || "No reply received.";

          // Replace placeholder with user speech, then append AI message
          setChats((prev) => {
            const updated = [...prev];
            const chat = updated[activeChat];
            const last = chat.messages.at(-1);
            if (last && last.from === "user") {
              last.text = userText || last.text;
            } else {
              chat.messages.push({ from: "user", text: userText });
            }
            chat.messages.push({ from: "ai", text: botText });
            updated[activeChat] = chat;
            return updated;
          });

          speakText(botText);
        } catch (err) {
          console.error("Backend error:", err);
        } finally {
          setLoading(false);
          setRecording(false);
          stream.getTracks().forEach((t) => t.stop());
        }
      };

      // 🧠 Add placeholder msg for user
      setChats((prev) => {
        const updated = [...prev];
        const chat = updated[activeChat] || { messages: [] };
        chat.messages = [...chat.messages, { from: "user", text: "..." }];
        updated[activeChat] = chat;
        return updated;
      });

      // Start browser speech recognition
      startSpeechRecognition();

      mediaRecorder.start();
      setRecording(true);

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 5000);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  // ➕ New Chat
  const handleNewChat = () => {
    const newChat = { title: `Chat ${chats.length + 1}`, messages: [] };
    setChats([...chats, newChat]);
    setActiveChat(chats.length);
  };

  // 🔘 Select chat
  const handleSelectChat = (index: number) => {
    if (index >= 0 && index < chats.length) {
      setActiveChat(index);
    }
  };

  // 🎤 Mic Button
  const MicButton = ({
    recording,
    onToggle,
  }: {
    recording: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative mt-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
        ${recording ? "bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"}
      `}
    >
      {recording && (
        <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></span>
      )}
      {!recording ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zM5 10a7 7 0 0014 0M12 17v4m-4 0h8"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-col flex-1 items-center justify-center">
        <h1 className="text-[clamp(1.25rem,2vw+0.5rem,1.5rem)] leading-[clamp(1.25rem,2vw+0.5rem,1.5rem)] font-semibold mb-4">
          🏥 AI Voice Receptionist
        </h1>

        <div className="max-w-[90%] md:max-w-[80%] w-full h-[65vh] md:h-[70vh] overflow-y-auto hide-scrollbar p-3 md:p-4 rounded-xl">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`my-2 p-2 md:p-3 rounded-xl text-sm md:text-base ${
                m.from === "user"
                  ? "bg-blue-600 text-right ml-auto w-fit max-w-[85%] md:max-w-[70%]"
                  : "bg-green-600 text-left mr-auto w-fit max-w-[85%] md:max-w-[70%]"
              }`}
              style={{
                fontSize: "clamp(0.85rem, 1vw + 0.4rem, 1rem)",
                lineHeight: "clamp(1.1rem, 1vw + 0.5rem, 1.4rem)",
              }}
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <div className="bg-green-600 text-left mr-auto w-fit max-w-[85%] md:max-w-[80%] my-2 p-2 md:p-3 rounded-xl animate-pulse text-sm md:text-base">
              Typing...
            </div>
          )}
        </div>

        <MicButton
          recording={recording}
          onToggle={() => {
            if (recording) {
              setRecording(false);
            } else {
              startRecording();
            }
          }}
        />

        <p
          className="mt-2 text-gray-400"
          style={{
            fontSize: "clamp(0.75rem, 1vw + 0.3rem, 0.9rem)",
            lineHeight: "clamp(1rem, 1vw + 0.3rem, 1.2rem)",
          }}
        >
          {recording ? "Listening..." : "Tap to speak"}
        </p>
      </div>
    </div>
  );
};

export default VoiceReceptionist;
