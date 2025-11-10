import { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import { img } from "../assets/img";
import { useNavigate } from "react-router-dom";

// ✅ Types
interface Message {
  from: "user" | "ai";
  text: string;
}

interface Chat {
  title: string;
  messages: Message[];
}

// ✅ Extend browser SpeechRecognition type
type ExtendedSpeechRecognition = SpeechRecognition;

const InsuranceReception = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const [chats, setChats] = useState<Chat[]>([
    { title: "Chat 1", messages: [] },
  ]);

  const [activeChat, setActiveChat] = useState(0);
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recognizedTextRef = useRef<string>("");

  const messages = useMemo(
    () => chats[activeChat]?.messages ?? [],
    [chats, activeChat]
  );

  // ✅ Browser TTS
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // ✅ Start Chat (Greeting)
  const handleStartChat = async () => {
    setChatStarted(true);

    try {
      const response = await fetch("http://localhost:8000/start?bot=insurance");

      if (!response.ok) throw new Error("Greeting failed");

      const botReply = response.headers.get("X-Text-Response") || "Hi there!";
      const responseBlob: Blob = await response.blob();

      setChats((prevChats) => {
        const updated = [...prevChats];
        updated[activeChat].messages.push({ from: "ai", text: botReply });
        return updated;
      });

      // ✅ If backend sends audio + play it
      if (responseBlob.type.startsWith("audio/")) {
        const audio = new Audio(URL.createObjectURL(responseBlob));
        await audio.play().catch(() => speakText(botReply));
      } else {
        speakText(botReply);
      }
    } catch {
      speakText("Sorry, I couldn’t fetch the greeting. Please try again.");
    }
  };

  // ✅ Speech Recognition (no any)
  const startSpeechRecognition = () => {
    // ✅ declare constructor from window properly
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.warn("Speech Recognition not supported in browser");
      return;
    }

    const recognition =
      new SpeechRecognitionConstructor() as ExtendedSpeechRecognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join("");

      recognizedTextRef.current = transcript;

      setChats((prevChats) => {
        const updated = [...prevChats];
        const lastMessage = updated[activeChat].messages.at(-1);

        if (lastMessage?.from === "user") lastMessage.text = transcript;
        else
          updated[activeChat].messages.push({ from: "user", text: transcript });

        return updated;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopSpeechRecognition = () => recognitionRef.current?.stop();

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
          formData.append("file", audioBlob, "audio.wav");
          formData.append("text", recognizedTextRef.current || "");

          const response = await fetch("http://127.0.0.1:8000/insurance", {
            method: "POST",
            body: formData,
          });

          const botReply = response.headers.get("X-Text-Response") ?? "";
          const responseBlob = await response.blob();
          const audio = new Audio(URL.createObjectURL(responseBlob));

          audio.onerror = () => speakText(botReply);
          await audio.play().catch(() => speakText(botReply));

          setChats((prev) => {
            const updated = [...prev];
            updated[activeChat].messages.push({ from: "ai", text: botReply });
            return updated;
          });
        } finally {
          setLoading(false);
        }
      };

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

  // ✅ Scroll on new message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  //   const handleNewChat = () => {
  //     setChats([...chats, { title: `Chat ${chats.length + 1}`, messages: [] }]);
  //     setActiveChat(chats.length);
  //   };

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
        ${
          recording
            ? "bg-red-600 animate-pulse"
            : "bg-green-500 hover:bg-green-600"
        }`}
    >
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
    <div className="flex h-screen bg-gray-100 text-black">
      {!chatStarted ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
          {/* 🔙 Back button in the top-left corner */}
          <button
            className="absolute top-6 left-6 px-4 py-2 text-black bg-gray-300 rounded hover:bg-gray-400 transition duration-200 ease-in-out shadow-md"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>

          <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-lg rounded-3xl p-10 flex flex-col items-center text-center">
            <div className="relative w-44 h-44 mb-6 border-4 border-blue-500 rounded-full overflow-hidden shadow-md text-center mx-auto">
              <img
                src={img.insurance_img}
                alt="AI Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <h1 className="text-3xl font-bold text-blue-800 mb-3">
              💼 Welcome to{" "}
              <span className="text-blue-600">Insurance AI Receptionist</span>
            </h1>

            <p className="text-gray-600 mb-8 max-w-md">
              Click below to start your conversation with our AI receptionist.
            </p>

            <button
              onClick={handleStartChat}
              className="bg-green-600 px-8 py-3 rounded-xl text-white text-lg font-medium hover:bg-green-700 transition-all border-none"
            >
              Start Chat
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* back button */}

          <Sidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
            avatar={img.insurance_img}
            name="AI Receptionist - Nate"
            subtitle="Your smart hospital assistant"
          />

          <div className="flex flex-col flex-1 items-center justify-center">
            <h1 className="text-xl font-semibold mb-4 hidden md:flex py-4">
              🏥 AI Voice Receptionist
            </h1>
            <div className="flex items-center gap-3 md:hidden py-4 py-lg-0">
              <img
                src={img.doctor_img}
                alt="AI Avatar"
                className="w-14 h-14 rounded-full border border-blue-500 shadow-md"
              />
              <div>
                <h2 className="text-black font-semibold text-lg">
                  AI Receptionist
                </h2>
                <p className="text-gray-800 text-xs leading-tight">
                  Your voice assistant
                </p>
              </div>
            </div>
            <div className="max-w-[90%] md:max-w-[80%] w-full h-[65vh] md:h-[70vh] overflow-y-auto hide-scrollbar p-3 md:p-4 rounded-xl">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`my-2 flex flex-col ${
                    m.from === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold mb-1 ${
                      m.from === "user" ? "text-blue-700" : "text-green-700"
                    }`}
                  >
                    {m.from === "user" ? "You" : "AI Receptionist"}
                  </span>

                  <div
                    className={`p-3 rounded-xl text-sm md:text-base font-medium shadow-sm ${
                      m.from === "user"
                        ? "bg-linear-to-tl from-[#FBD6FF] to-[#C3EEFF] ml-auto"
                        : "bg-linear-to-tl from-[#C3EEFF] to-[#FBD6FF] mr-auto"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="bg-green-600 w-fit p-3 rounded-xl text-white animate-pulse">
                  Typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <MicButton
              recording={recording}
              onToggle={() => {
                if (recording) {
                  stopSpeechRecognition();
                  setRecording(false);
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

export default InsuranceReception;
