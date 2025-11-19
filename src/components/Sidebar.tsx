import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { img } from "../assets/img";

interface Chat {
  title: string;
  messages: { from: "user" | "ai"; text: string }[];
}

interface SidebarProps {
  chats: Chat[];
  activeChat: number;
  onSelectChat: (index: number) => void;
  avatar?: string;
  name?: string;
  subtitle?: string;
}

const Sidebar = ({
  chats = [],
  activeChat,
  onSelectChat,
  avatar = img.insurance_img, // ✅ default image
  name = "AI Receptionist - Nate", // ✅ default name
  subtitle = "Your smart assistant for patient queries", // ✅ default subtitle
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 📱 Mobile Header */}
      <div className="hidden px-4 py-3 bg-white border-b border-gray-800">
        <div className="flex gap-3">
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full border border-blue-500 shadow-md"
          />
          <div>
            <h2 className="text-black font-semibold text-base">{name}</h2>
            <p className="text-gray-800 text-xs leading-tight">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* 💻 Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-[280px] lg:w-[340px] bg-white border-r border-gray-700 flex flex-col transform transition-transform duration-300 z-50 shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 🧭 Sidebar Header */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 p-6 border-b border-gray-700">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-md animate-pulse"
          />
          <h2 className="text-black font-semibold text-lg">{name}</h2>
          <p className="text-gray-800 text-xs text-center">{subtitle}</p>
        </div>

        {/* 🗂️ Chat List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-2 py-3">
          {chats.length === 0 ? (
            <p className="text-gray-400 text-center mt-6 text-sm">
              No chats yet — start one!
            </p>
          ) : (
            chats.map((chat, index) => (
              <div
                key={index}
                onClick={() => {
                  onSelectChat(index);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer border border-transparent hover:border-blue-500 hover:bg-gray-800/40 transition-all duration-200 ${
                  activeChat === index ? "bg-gray-700/60 border-blue-500" : ""
                }`}
              >
                <MessageSquare
                  size={18}
                  className="text-blue-400 shrink-0 opacity-80"
                />
                <span className="truncate text-gray-700">
                  {chat.title || `Chat ${index + 1}`}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ❌ Close Button (mobile) */}
        {isOpen && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* 🕶️ Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
