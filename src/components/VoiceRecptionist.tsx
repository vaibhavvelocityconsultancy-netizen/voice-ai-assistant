import React, { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import { img } from "../assets/img";

const VoiceReceptionist = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [chats, setChats] = useState([{ title: "Chat 1", messages: [] }]);
  const [activeChat, setActiveChat] = useState(0);
  const recognitionRef = useRef<any>(null);

  const messages = chats[activeChat]?.messages || [];

  // 🧠 Fetch Greeting after Start Chat button is clicked
  const handleStartChat = async () => {
    setChatStarted(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/start");
      console.log("Headers:", [...response.headers.entries()]);

      if (!response.ok) throw new Error("Greeting fetch failed");

      const botReply = response.headers.get("X-Text-Response") || "Hi there!";
      console.log("Bot reply:", botReply);

      const responseBlob = await response.blob();

      // 💬 Update chat UI
      setChats((prev) => {
        const updated = [...prev];
        updated[activeChat].messages.push({ from: "ai", text: botReply });
        return updated;
      });

      // 🎵 Play backend audio
      if (responseBlob.type.startsWith("audio/") && responseBlob.size > 0) {
        const audioUrl = URL.createObjectURL(responseBlob);
        const audio = new Audio(audioUrl);

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          speakText(botReply); // fallback TTS
        };

        await audio.play().catch((err) => {
          console.error("Audio play failed:", err);
          speakText(botReply);
        });
      } else {
        console.warn("No valid audio in response — using browser TTS");
        speakText(botReply);
      }
    } catch (err) {
      console.error("Greeting error:", err);
      speakText("Sorry, I couldn’t fetch the greeting. Please try again.");
    }
  };

  // 🔊 Browser fallback TTS
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // 🎤 Speech Recognition setup
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

      setChats((prev) => {
        const updated = [...prev];
        const chat = updated[activeChat] || { messages: [] };
        const lastMsg = chat.messages.at(-1);
        if (lastMsg && lastMsg.from === "user") lastMsg.text = transcript;
        else chat.messages.push({ from: "user", text: transcript });
        updated[activeChat] = chat;
        return updated;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => recognitionRef.current?.stop?.();

  // 🎙️ Record & Send audio to backend
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        stopSpeechRecognition();
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setLoading(true);

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");

          const response = await fetch("http://127.0.0.1:8000/stt", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error(await response.text());

          const botReply = response.headers.get("X-Text-Response");
          const responseBlob = await response.blob();
          const audioUrl = URL.createObjectURL(responseBlob);

          const audio = new Audio(audioUrl);

          audio.onerror = (e) => {
            console.error("Audio error:", e);
            speakText(botReply || "Sorry, I didn’t catch that.");
          };

          await audio.play().catch((err) => {
            console.error("Audio play failed:", err);
            speakText(botReply || "Sorry, I didn’t catch that.");
          });

          setChats((prev) => {
            const updated = [...prev];
            updated[activeChat].messages.push({ from: "ai", text: botReply });
            return updated;
          });
        } catch (err) {
          console.error("Backend error:", err);
        } finally {
          setLoading(false);
        }
      };

      // Temporary user message
      setChats((prev) => {
        const updated = [...prev];
        updated[activeChat].messages.push({ from: "user", text: "..." });
        return updated;
      });

      startSpeechRecognition();
      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }, 5000);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  // ➕ New chat
  const handleNewChat = () => {
    const newChat = { title: `Chat ${chats.length + 1}`, messages: [] };
    setChats([...chats, newChat]);
    setActiveChat(chats.length);
  };

  // 🔘 Select chat
  const handleSelectChat = (index: number) => {
    if (index >= 0 && index < chats.length) setActiveChat(index);
  };

  // 🎤 Mic button component
  const MicButton = ({ recording, onToggle }: { recording: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative mt-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
        ${recording ? "bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"}`}
    >
      {recording && (
        <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></span>
      )}
      {!recording ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zM5 10a7 7 0 0014 0M12 17v4m-4 0h8" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      )}
    </button>
  );

  // 🧩 Render UI
  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {!chatStarted ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="border rounded-full h-50 w-50 mb-3">
            <img src={img.doctor_img} alt="AI Avatar" className="w-full h-full rounded-full" />
          </div>
          <h1 className="text-3xl mb-4 font-semibold">🏥 Welcome to Voice AI Receptionist</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Click below to start your conversation with our AI receptionist.
          </p>
          <button
            onClick={handleStartChat}
            className="bg-green-600 cursor-pointer px-6 py-3 rounded-xl text-white text-lg hover:bg-green-700 transition-all"
          >
            Start Chat
          </button>
        </div>
      ) : (
        <>
          <Sidebar chats={chats} activeChat={activeChat} onSelectChat={handleSelectChat} onNewChat={handleNewChat} />

          <div className="flex flex-col flex-1 items-center justify-center">
            <h1 className="text-[clamp(1.25rem,2vw+0.5rem,1.5rem)] font-semibold mb-4">
              🏥 AI Voice Receptionist
            </h1>

            <div className="max-w-[90%] md:max-w-[80%] w-full h-[65vh] md:h-[70vh] overflow-y-auto hide-scrollbar p-3 md:p-4 rounded-xl">
              {messages.map((m, i) => (
                <div key={i} className={`my-2 flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
                  {/* 💬 Sender label */}
                  <span
                    className={`text-xs font-semibold mb-1 ${m.from === "user" ? "text-blue-700" : "text-green-700"
                      }`}
                  >
                    {m.from === "user" ? "You" : "AI Receptionist"}
                  </span>

                  {/* 💭 Message bubble */}
                  <div
                    className={`p-2 md:p-3 rounded-xl text-sm md:text-base font-medium shadow-sm ${m.from === "user"
                      ? "bg-gradient-to-tl from-[#FBD6FF] to-[#C3EEFF] text-right ml-auto w-fit max-w-[85%]"
                      : "bg-gradient-to-tl from-[#C3EEFF] to-[#FBD6FF] text-left mr-auto w-fit max-w-[85%]"
                      }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="bg-gray-600 text-left mr-auto w-fit max-w-[85%] my-2 p-2 md:p-3 rounded-xl animate-pulse text-sm md:text-base">
                  Typing...
                </div>
              )}
            </div>

            <MicButton
              recording={recording}
              onToggle={() => {
                if (recording) {
                  setRecording(false);
                  stopSpeechRecognition();
                } else {
                  startRecording();
                }
              }}
            />

            <p className="mt-2 text-gray-400 text-sm">
              {recording ? "Listening..." : "Tap to speak"}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceReceptionist;  