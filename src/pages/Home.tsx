import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { img } from "../assets/img";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello! I’m your AI Receptionist.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch greeting from backend (optional)
    const fetchGreeting = async () => {
      try {
        const res = await fetch("https://briefly-unretrenched-drucilla.ngrok-free.dev/start");
        if (!res.ok) throw new Error(await res.text());

        const botReply = res.headers.get("X-Text-Response");
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        new Audio(audioUrl).play();

        setGreeting(botReply);
      } catch (err) {
        console.error("Greeting API failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white text-center">
      <img
        src={img.doctor_img} 
        alt="AI Receptionist"
        className="w-40 h-40 rounded-full shadow-2xl border-4 border-blue-600 mb-6 animate-fade-in"
      />

      {loading ? (
        <p className="text-gray-400 text-lg animate-pulse">Loading greeting...</p>
      ) : (
        <p className="text-2xl font-semibold mb-8 max-w-[80%] leading-relaxed">{greeting}</p>
      )}

      <button
        onClick={() => navigate("/chat")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
      >
        Start Chat
      </button>
    </div>
  );
};

export default Home;
