import React, { useState } from "react";

const Sidebar = ({ chats = [], activeChat, onSelectChat, onNewChat }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 📱 Mobile Header (visible only on small screens) */}
      <div className="lg:hidden px-4 py-3 md:bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
        {/* <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={onNewChat}
          className="bg-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-700"
        >
          + New
        </button> */}
      </div>

      {/* 💻 Sidebar Container */}
      <div
        className={`fixed lg:static top-0 left-0 h-full w-[280px] lg:w-[400px] md:bg-gray-800 border-r border-gray-700 flex flex-col transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* 🧭 Sidebar Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button
            onClick={onNewChat}
            className="bg-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-700"
          >
            + New
          </button>
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {chats.length === 0 ? (
            <p className="text-gray-400 text-center mt-4">No chats yet</p>
          ) : (
            chats.map((chat, index) => (
              <div
                key={index}
                onClick={() => {
                  onSelectChat(index);
                  setIsOpen(false); // close menu on mobile
                }}
                className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${activeChat === index ? "bg-gray-700" : ""
                  }`}
              >
                {chat.title || `Chat ${index + 1}`}
              </div>
            ))
          )}
        </div>

        {/* Mobile-only new chat button */}
        <div className="md:hidden  border-t border-gray-700">
           <button
            onClick={onNewChat}
            className="bg-blue-600 w-full p-4 flex  text-sm hover:bg-blue-700"
          >
            + New
          </button>
        </div>

      </div>

      {/* 🕶️ Overlay for mobile (click to close sidebar) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
