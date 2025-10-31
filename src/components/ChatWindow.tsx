import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../Store/store";

const ChatWindow = () => {
  const messages = useSelector((state: RootState) => state.conversation.message);

  return (
    <div className="flex flex-col gap-3 h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-xl">
      {messages.map((msg: { role: "user" | "assistant"; text: string }, index: number) => (
        <div
          key={index}
          className={`p-3 rounded-lg max-w-[70%] ${
            msg.role === "user"
              ? "bg-blue-600 text-white self-end"
              : "bg-gray-200 text-gray-900 self-start"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
